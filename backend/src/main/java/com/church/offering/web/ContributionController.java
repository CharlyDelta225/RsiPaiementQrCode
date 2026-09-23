package com.church.offering.web;

import com.church.offering.dto.contribution.ContributionRequest;
import com.church.offering.dto.contribution.ContributionView;
import com.church.offering.model.enums.PaymentStatus;
import com.church.offering.security.UserPrincipal;
import com.church.offering.service.ContributionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ContributionController {

    private final ContributionService contributionService;

    public ContributionController(ContributionService contributionService) {
        this.contributionService = contributionService;
    }

    @PostMapping("/contributions")
    public ResponseEntity<ContributionView> create(@Valid @RequestBody ContributionRequest request,
                                                   @AuthenticationPrincipal UserPrincipal principal) {
        ContributionRequest resolved = resolveMember(request, principal);
        return ResponseEntity.status(HttpStatus.CREATED).body(contributionService.create(resolved));
    }

    @GetMapping("/my/contributions")
    @PreAuthorize("hasRole('MEMBER')")
    public List<ContributionView> myContributions(@AuthenticationPrincipal UserPrincipal principal) {
        return contributionService.memberHistory(principal);
    }

    @GetMapping("/admin/contributions")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTEUR', 'TREASURER')")
    public List<ContributionView> list(@RequestParam(required = false) String search,
                                       @RequestParam(required = false) Long templeId,
                                       @RequestParam(required = false) Long offeringTypeId,
                                       @RequestParam(required = false) PaymentStatus status,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return contributionService.list(search, templeId, offeringTypeId, status, from, to);
    }

    @GetMapping("/admin/contributions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PASTEUR', 'TREASURER')")
    public ContributionView get(@PathVariable Long id) {
        return contributionService.get(id);
    }

    @PostMapping("/admin/contributions/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'TREASURER')")
    public ContributionView cancel(@PathVariable Long id) {
        return contributionService.cancel(id);
    }

    private ContributionRequest resolveMember(ContributionRequest request, UserPrincipal principal) {
        if (principal == null || request.memberId() != null) {
            return request;
        }
        Long memberId = contributionService.memberIdByUser(principal);
        if (memberId == null) {
            return request;
        }
        return new ContributionRequest(
                request.templeId(), request.offeringTypeId(), request.amount(), request.currencyCode(),
                request.paymentMethod(), memberId, request.donorName(), request.donorPhone(), request.note());
    }
}