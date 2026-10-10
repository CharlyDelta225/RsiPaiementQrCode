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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Confirme un paiement en mode simulation et émet le reçu.
 * Point unique à remplacer par l'appel à l'agrégateur réel.
 * Désactivable (`app.payment.simulation-enabled=false`) : à couper en production, sinon
 * n'importe qui pourrait marquer un don comme payé.
 */
@Component
public class SimulatedPaymentProcessor {

    private static final Logger log = LoggerFactory.getLogger(SimulatedPaymentProcessor.class);

    private static final String SIMULATED_TRANSACTION_PREFIX = "SIM-";
    private static final String SIMULATED_RAW_REQUEST = "{\"simulated\":true}";

    private final ContributionRepository contributionRepository;
    private final PaymentRepository paymentRepository;
    private final ReceiptRepository receiptRepository;
    private final ReferenceGenerator referenceGenerator;
    private final boolean enabled;

    public SimulatedPaymentProcessor(ContributionRepository contributionRepository,
                                     PaymentRepository paymentRepository,
                                     ReceiptRepository receiptRepository,
                                     ReferenceGenerator referenceGenerator,
                                     @Value("${app.payment.simulation-enabled:false}") boolean enabled) {
        this.contributionRepository = contributionRepository;
        this.paymentRepository = paymentRepository;
        this.receiptRepository = receiptRepository;
        this.referenceGenerator = referenceGenerator;
        this.enabled = enabled;
        if (enabled) {
            log.warn("Paiement SIMULÉ actif : aucun débit réel. À désactiver en production "
                    + "(PAYMENT_SIMULATION_ENABLED=false).");
        }
    }

    /** Crée le paiement initial (PENDING) rattaché à la contribution. */
    @Transactional
    public Payment open(Contribution contribution, PaymentProvider provider) {
        ensureEnabled();
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
        ensureEnabled();
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

    private void ensureEnabled() {
        if (!enabled) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Le paiement en ligne n'est pas encore disponible");
        }
    }

    public static PaymentMethod paymentMethodFor(PaymentProvider provider) {
        return switch (provider) {
            case CARD, STRIPE -> PaymentMethod.CARD;
            case SIMULATED, MOOV_MONEY, ORANGE_MONEY, MTN_MOBILE_MONEY, WAVE -> PaymentMethod.MOBILE_MONEY;
        };
    }
}
