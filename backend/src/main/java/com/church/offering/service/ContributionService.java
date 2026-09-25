package com.church.offering.service;

import com.church.offering.dto.contribution.ContributionRequest;
import com.church.offering.dto.contribution.ContributionView;
import com.church.offering.model.Church;
import com.church.offering.model.Contribution;
import com.church.offering.model.Member;
import com.church.offering.model.OfferingType;
import com.church.offering.model.Temple;
import com.church.offering.model.enums.PaymentMethod;
import com.church.offering.model.enums.PaymentStatus;
import com.church.offering.repository.ChurchRepository;
import com.church.offering.repository.ContributionRepository;
import com.church.offering.repository.MemberRepository;
import com.church.offering.repository.OfferingTypeRepository;
import com.church.offering.repository.TempleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ContributionService {

    private final ContributionRepository contributionRepository;
    private final OfferingTypeRepository offeringTypeRepository;
    private final TempleRepository templeRepository;
    private final MemberRepository memberRepository;
    private final ChurchRepository churchRepository;
    private final ReferenceGenerator referenceGenerator;

    public ContributionService(ContributionRepository contributionRepository,
                               OfferingTypeRepository offeringTypeRepository,
                               TempleRepository templeRepository,
                               MemberRepository memberRepository,
                               ChurchRepository churchRepository,
                               ReferenceGenerator referenceGenerator) {
        this.contributionRepository = contributionRepository;
        this.offeringTypeRepository = offeringTypeRepository;
        this.templeRepository = templeRepository;
        this.memberRepository = memberRepository;
        this.churchRepository = churchRepository;
        this.referenceGenerator = referenceGenerator;
    }

    @Transactional
    public ContributionView create(ContributionRequest request) {
        Temple temple = findTemple(request.templeId());
        OfferingType offeringType = offeringTypeRepository.findById(request.offeringTypeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Type d'offrande introuvable"));

        Contribution contribution = new Contribution();
        contribution.setReference(nextReference());
        contribution.setAmount(request.amount());
        contribution.setCurrencyCode(defaultCurrency(request));
        contribution.setPaymentMethod(request.paymentMethod() != null ? request.paymentMethod() : PaymentMethod.MOBILE_MONEY);
        contribution.setStatus(PaymentStatus.PENDING);
        contribution.setTemple(temple);
        contribution.setOfferingType(offeringType);
        contribution.setDonorName(trimToNull(request.donorName()));
        contribution.setDonorPhone(trimToNull(request.donorPhone()));
        contribution.setNote(trimToNull(request.note()));

        if (request.memberId() != null) {
            Member member = memberRepository.findById(request.memberId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Membre introuvable"));
            contribution.setMember(member);
        }

        return ContributionView.from(contributionRepository.save(contribution));
    }

    @Transactional(readOnly = true)
    public List<ContributionView> list(String search, Long templeId, Long offeringTypeId,
                                       PaymentStatus status, LocalDate from, LocalDate to) {
        LocalDateTime fromTs = from != null ? from.atStartOfDay() : null;
        LocalDateTime toTs = to != null ? to.atTime(LocalTime.MAX) : null;
        return contributionRepository.search(search, templeId, offeringTypeId, status, fromTs, toTs)
                .stream().map(ContributionView::from).toList();
    }

    @Transactional(readOnly = true)
    public ContributionView get(Long id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contribution introuvable"));
        return ContributionView.from(contribution);
    }

    @Transactional(readOnly = true)
    public Long memberIdByUser(com.church.offering.security.UserPrincipal principal) {
        if (principal == null || principal.id() == null) {
            return null;
        }
        return memberRepository.findByUser_Id(principal.id())
                .map(Member::getId).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ContributionView> memberHistory(com.church.offering.security.UserPrincipal principal) {
        Long memberId = memberIdByUser(principal);
        if (memberId == null) {
            return List.of();
        }
        return contributionRepository.findByMemberIdOrderByPaidAtDesc(memberId)
                .stream().map(ContributionView::from).toList();
    }

    @Transactional
    public ContributionView cancel(Long id) {
        Contribution contribution = contributionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contribution introuvable"));
        if (contribution.getStatus() == PaymentStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Une contribution payée ne peut pas être annulée");
        }
        contribution.setStatus(PaymentStatus.CANCELLED);
        return ContributionView.from(contributionRepository.save(contribution));
    }

    private String defaultCurrency(ContributionRequest request) {
        if (request.currencyCode() != null && !request.currencyCode().isBlank()) {
            return request.currencyCode().trim().toUpperCase();
        }
        return currentChurch().getCurrencyCode();
    }

    private Church currentChurch() {
        return churchRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Aucune église configurée"));
    }

    private Temple findTemple(Long id) {
        return templeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Temple inconnu"));
    }

    private String nextReference() {
        return referenceGenerator.nextContributionReference();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}