package com.church.offering.service;

import com.church.offering.dto.publicdonation.PublicContributionCreated;
import com.church.offering.dto.publicdonation.PublicContributionRequest;
import com.church.offering.dto.publicdonation.PublicContributionView;
import com.church.offering.dto.publicdonation.PublicOfferingTypeView;
import com.church.offering.model.Church;
import com.church.offering.model.Contribution;
import com.church.offering.model.OfferingType;
import com.church.offering.model.Payment;
import com.church.offering.model.Receipt;
import com.church.offering.model.Temple;
import com.church.offering.model.enums.PaymentProvider;
import com.church.offering.model.enums.PaymentStatus;
import com.church.offering.repository.ChurchRepository;
import com.church.offering.repository.ContributionRepository;
import com.church.offering.repository.OfferingTypeRepository;
import com.church.offering.repository.PaymentRepository;
import com.church.offering.repository.TempleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PublicDonationService {

    private final ChurchRepository churchRepository;
    private final TempleRepository templeRepository;
    private final OfferingTypeRepository offeringTypeRepository;
    private final ContributionRepository contributionRepository;
    private final PaymentRepository paymentRepository;
    private final ReferenceGenerator referenceGenerator;
    private final SimulatedPaymentProcessor paymentProcessor;

    public PublicDonationService(ChurchRepository churchRepository,
                                 TempleRepository templeRepository,
                                 OfferingTypeRepository offeringTypeRepository,
                                 ContributionRepository contributionRepository,
                                 PaymentRepository paymentRepository,
                                 ReferenceGenerator referenceGenerator,
                                 SimulatedPaymentProcessor paymentProcessor) {
        this.churchRepository = churchRepository;
        this.templeRepository = templeRepository;
        this.offeringTypeRepository = offeringTypeRepository;
        this.contributionRepository = contributionRepository;
        this.paymentRepository = paymentRepository;
        this.referenceGenerator = referenceGenerator;
        this.paymentProcessor = paymentProcessor;
    }

    @Transactional(readOnly = true)
    public List<PublicOfferingTypeView> offeringTypes() {
        return offeringTypeRepository.findByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(PublicOfferingTypeView::from)
                .toList();
    }

    @Transactional
    public PublicContributionCreated create(PublicContributionRequest request) {
        if (request.paymentProvider() == PaymentProvider.SIMULATED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Moyen de paiement non disponible pour le don public");
        }
        OfferingType offeringType = offeringTypeRepository.findById(request.offeringTypeId())
                .filter(OfferingType::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Type d'offrande introuvable"));
        Church church = currentChurch();
        Temple temple = templeRepository.findFirstByChurchIdAndActiveTrueOrderByIdAsc(church.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Aucun temple actif configuré"));

        Contribution contribution = new Contribution();
        contribution.setReference(referenceGenerator.nextContributionReference());
        contribution.setAmount(request.amount());
        contribution.setCurrencyCode(church.getCurrencyCode());
        contribution.setPaymentMethod(SimulatedPaymentProcessor.paymentMethodFor(request.paymentProvider()));
        contribution.setStatus(PaymentStatus.PENDING);
        contribution.setTemple(temple);
        contribution.setOfferingType(offeringType);
        contribution.setDonorName(trimToNull(request.donorName()));
        contribution.setDonorPhone(trimToNull(request.donorPhone()));

        Contribution saved = contributionRepository.save(contribution);

        paymentProcessor.open(saved, request.paymentProvider());

        return new PublicContributionCreated(saved.getId(), saved.getReference());
    }

    @Transactional
    public PublicContributionView simulatePayment(Long contributionId) {
        Contribution contribution = contributionRepository.findById(contributionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contribution introuvable"));
        if (contribution.getStatus() == PaymentStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cette contribution a été annulée");
        }
        if (contribution.getMember() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Seules les contributions du don public peuvent être simulées");
        }
        Payment payment = paymentRepository.findFirstByContributionIdOrderByIdAsc(contributionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Paiement initial introuvable"));

        Receipt receipt = paymentProcessor.confirm(contribution, payment);
        return PublicContributionView.from(contribution, payment, receipt);
    }

    private Church currentChurch() {
        return churchRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Aucune église configurée"));
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
