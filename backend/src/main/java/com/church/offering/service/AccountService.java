package com.church.offering.service;

import com.church.offering.dto.account.MemberDonationRequest;
import com.church.offering.dto.account.PasswordChangeRequest;
import com.church.offering.dto.account.ProfileUpdateRequest;
import com.church.offering.dto.auth.UserView;
import com.church.offering.dto.publicdonation.PublicContributionView;
import com.church.offering.model.Contribution;
import com.church.offering.model.Member;
import com.church.offering.model.OfferingType;
import com.church.offering.model.Payment;
import com.church.offering.model.Receipt;
import com.church.offering.model.User;
import com.church.offering.model.enums.PaymentProvider;
import com.church.offering.model.enums.PaymentStatus;
import com.church.offering.repository.ChurchRepository;
import com.church.offering.repository.ContributionRepository;
import com.church.offering.repository.MemberRepository;
import com.church.offering.repository.OfferingTypeRepository;
import com.church.offering.repository.PaymentRepository;
import com.church.offering.repository.ReceiptRepository;
import com.church.offering.repository.UserRepository;
import com.church.offering.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Opérations en libre-service du membre connecté : don, reçu, profil, mot de passe.
 */
@Service
public class AccountService {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final OfferingTypeRepository offeringTypeRepository;
    private final ContributionRepository contributionRepository;
    private final PaymentRepository paymentRepository;
    private final ReceiptRepository receiptRepository;
    private final ChurchRepository churchRepository;
    private final ReferenceGenerator referenceGenerator;
    private final SimulatedPaymentProcessor paymentProcessor;
    private final PasswordEncoder passwordEncoder;

    public AccountService(UserRepository userRepository,
                          MemberRepository memberRepository,
                          OfferingTypeRepository offeringTypeRepository,
                          ContributionRepository contributionRepository,
                          PaymentRepository paymentRepository,
                          ReceiptRepository receiptRepository,
                          ChurchRepository churchRepository,
                          ReferenceGenerator referenceGenerator,
                          SimulatedPaymentProcessor paymentProcessor,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.offeringTypeRepository = offeringTypeRepository;
        this.contributionRepository = contributionRepository;
        this.paymentRepository = paymentRepository;
        this.receiptRepository = receiptRepository;
        this.churchRepository = churchRepository;
        this.referenceGenerator = referenceGenerator;
        this.paymentProcessor = paymentProcessor;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public PublicContributionView donate(UserPrincipal principal, MemberDonationRequest request) {
        if (request.paymentProvider() == PaymentProvider.SIMULATED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Moyen de paiement non disponible");
        }
        Member member = currentMember(principal);
        OfferingType offeringType = offeringTypeRepository.findById(request.offeringTypeId())
                .filter(OfferingType::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Type d'offrande introuvable"));
        String currency = churchRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Aucune église configurée"))
                .getCurrencyCode();

        Contribution contribution = new Contribution();
        contribution.setReference(referenceGenerator.nextContributionReference());
        contribution.setAmount(request.amount());
        contribution.setCurrencyCode(currency);
        contribution.setPaymentMethod(SimulatedPaymentProcessor.paymentMethodFor(request.paymentProvider()));
        contribution.setStatus(PaymentStatus.PENDING);
        contribution.setTemple(member.getTemple());
        contribution.setOfferingType(offeringType);
        contribution.setMember(member);
        contribution = contributionRepository.save(contribution);

        Payment payment = paymentProcessor.open(contribution, request.paymentProvider());
        Receipt receipt = paymentProcessor.confirm(contribution, payment);
        return PublicContributionView.from(contribution, payment, receipt);
    }

    @Transactional(readOnly = true)
    public PublicContributionView contributionDetail(UserPrincipal principal, Long contributionId) {
        Member member = currentMember(principal);
        Contribution contribution = contributionRepository.findById(contributionId)
                .filter(c -> c.getMember() != null && c.getMember().getId().equals(member.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contribution introuvable"));
        Payment payment = paymentRepository.findFirstByContributionIdOrderByIdAsc(contributionId).orElse(null);
        if (payment == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aucun paiement pour cette contribution");
        }
        Receipt receipt = receiptRepository.findByContributionId(contributionId).orElse(null);
        return PublicContributionView.from(contribution, payment, receipt);
    }

    @Transactional
    public UserView updateProfile(UserPrincipal principal, ProfileUpdateRequest request) {
        User user = currentUser(principal);
        String phone = request.phone().trim();
        Member member = memberRepository.findByUser_Id(user.getId()).orElse(null);
        if (member != null && memberRepository.existsByPhoneAndIdNot(phone, member.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce numéro de téléphone est déjà utilisé");
        }

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(phone);
        user = userRepository.save(user);

        if (member != null) {
            member.setFullName(user.getFirstName() + " " + user.getLastName());
            member.setPhone(phone);
            memberRepository.save(member);
        }
        return UserView.from(user);
    }

    @Transactional
    public void changePassword(UserPrincipal principal, PasswordChangeRequest request) {
        User user = currentUser(principal);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mot de passe actuel incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    private User currentUser(UserPrincipal principal) {
        return userRepository.findById(principal.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session invalide"));
    }

    private Member currentMember(UserPrincipal principal) {
        return memberRepository.findByUser_Id(principal.id())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Aucun profil membre associé à ce compte"));
    }
}
