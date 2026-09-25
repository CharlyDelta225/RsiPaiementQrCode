package com.church.offering.service;

import com.church.offering.repository.ContributionRepository;
import com.church.offering.repository.ReceiptRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class ReferenceGenerator {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    private final ContributionRepository contributionRepository;
    private final ReceiptRepository receiptRepository;

    public ReferenceGenerator(ContributionRepository contributionRepository,
                              ReceiptRepository receiptRepository) {
        this.contributionRepository = contributionRepository;
        this.receiptRepository = receiptRepository;
    }

    public String nextContributionReference() {
        String reference;
        do {
            reference = "CONT-" + LocalDateTime.now().format(TS) + "-" + suffix();
        } while (contributionRepository.existsByReference(reference));
        return reference;
    }

    public String nextReceiptNumber() {
        String number;
        do {
            number = "REC-" + LocalDateTime.now().format(TS) + "-" + suffix();
        } while (receiptRepository.existsByReceiptNumber(number));
        return number;
    }

    private String suffix() {
        StringBuilder sb = new StringBuilder(4);
        ThreadLocalRandom random = ThreadLocalRandom.current();
        for (int i = 0; i < 4; i++) {
            sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
