package com.church.offering.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "receipts")
public class Receipt extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "contribution_id", nullable = false, unique = true)
    private Contribution contribution;

    @Column(nullable = false, unique = true, length = 30)
    private String receiptNumber;

    @Column(nullable = false, unique = true, length = 64)
    private String verificationToken;

    private String pdfPath;

    @Column(nullable = false)
    private boolean sentByEmail = false;

    private LocalDateTime emailedAt;
}