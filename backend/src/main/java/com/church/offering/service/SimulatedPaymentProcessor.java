package com.church.offering.service;

import com.church.offering.model.Contribution;
import com.church.offering.model.Payment;
import com.church.offering.model.Receipt;
import com.church.offering.model.enums.PaymentMethod;
import com.church.offering.model.enums.PaymentProvider;
import com.church.offering.model.enums.PaymentStatus;
import com.church.offering.repository.ContributionRepository;
import com.church.offering.repository.PaymentRepository;
import com.church.offering.repository.ReceiptRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Confirme un paiement en mode simulation et émet le reçu.
 * Point unique à remplacer par l'appel à l'agrégateur réel.
 */
@Component
public class SimulatedPaymentProcessor {

    private static final String SIMULATED_TRANSACTION_PREFIX = "SIM-";
    private static final String SIMULATED_RAW_REQUEST = "{\"simulated\":true}";

    private final ContributionRepository contributionRepository;
    private final PaymentRepository paymentRepository;
    private final ReceiptRepository receiptRepository;
    private final ReferenceGenerator referenceGenerator;

    public SimulatedPaymentProcessor(ContributionRepository contributionRepository,
                                     PaymentRepository paymentRepository,
                                     ReceiptRepository receiptRepository,
                                     ReferenceGenerator referenceGenerator) {
        this.contributionRepository = contributionRepository;
        this.paymentRepository = paymentRepository;
        this.receiptRepository = receiptRepository;
        this.referenceGenerator = referenceGenerator;
    }

    /** Crée le paiement initial (PENDING) rattaché à la contribution. */
    @Transactional
    public Payment open(Contribution contribution, PaymentProvider provider) {
        Payment payment = new Payment();
        payment.setContribution(contribution);
        payment.setProvider(provider);
        payment.setAmount(contribution.getAmount());
        payment.setCurrencyCode(contribution.getCurrencyCode());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setSimulated(true);
        return paymentRepository.save(payment);
    }

    /** Marque contribution + paiement comme payés et émet le reçu (idempotent). */
    @Transactional
    public Receipt confirm(Contribution contribution, Payment payment) {
        Receipt receipt = receiptRepository.findByContributionId(contribution.getId()).orElse(null);
        if (contribution.getStatus() == PaymentStatus.PAID && receipt != null) {
            return receipt;
        }
        LocalDateTime now = LocalDateTime.now();
        contribution.setStatus(PaymentStatus.PAID);
        contribution.setPaidAt(now);
        contributionRepository.save(contribution);

        payment.setProviderTransactionId(SIMULATED_TRANSACTION_PREFIX + UUID.randomUUID().toString().replace("-", ""));
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaidAt(now);
        payment.setRawRequest(SIMULATED_RAW_REQUEST);
        payment.setRawResponse("{\"status\":\"PAID\",\"provider\":\"" + payment.getProvider() + "\",\"simulated\":true}");
        paymentRepository.save(payment);

        if (receipt == null) {
            receipt = new Receipt();
            receipt.setContribution(contribution);
            receipt.setReceiptNumber(referenceGenerator.nextReceiptNumber());
            receipt.setVerificationToken(UUID.randomUUID().toString().replace("-", ""));
            receipt = receiptRepository.save(receipt);
        }
        return receipt;
    }

    public static PaymentMethod paymentMethodFor(PaymentProvider provider) {
        return switch (provider) {
            case CARD, STRIPE -> PaymentMethod.CARD;
            case SIMULATED, MOOV_MONEY, ORANGE_MONEY, MTN_MOBILE_MONEY, WAVE -> PaymentMethod.MOBILE_MONEY;
        };
    }
}
