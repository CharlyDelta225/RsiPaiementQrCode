package com.church.offering.web;

import com.church.offering.dto.publicdonation.PublicContributionCreated;
import com.church.offering.dto.publicdonation.PublicContributionRequest;
import com.church.offering.dto.publicdonation.PublicContributionView;
import com.church.offering.dto.publicdonation.PublicOfferingTypeView;
import com.church.offering.service.PublicDonationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public")
public class PublicDonationController {

    private final PublicDonationService publicDonationService;

    public PublicDonationController(PublicDonationService publicDonationService) {
        this.publicDonationService = publicDonationService;
    }

    @GetMapping("/offering-types")
    public List<PublicOfferingTypeView> offeringTypes() {
        return publicDonationService.offeringTypes();
    }

    @PostMapping("/contributions")
    public ResponseEntity<PublicContributionCreated> create(@Valid @RequestBody PublicContributionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(publicDonationService.create(request));
    }

    @PostMapping("/contributions/{id}/simulate-payment")
    public PublicContributionView simulatePayment(@PathVariable Long id) {
        return publicDonationService.simulatePayment(id);
    }
}
