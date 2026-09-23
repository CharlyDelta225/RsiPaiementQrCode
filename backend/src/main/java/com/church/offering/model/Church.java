package com.church.offering.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "churches")
public class Church extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    private String slogan;

    @Column(nullable = false, length = 3)
    private String currencyCode;

    @Column(nullable = false, length = 8)
    private String currencySymbol;

    @Column(nullable = false, length = 60)
    private String country;

    @Column(columnDefinition = "TEXT")
    private String receiptFooter;

    @Column(nullable = false)
    private boolean active = true;
}