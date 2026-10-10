package com.church.offering.web;

import com.church.offering.dto.account.MemberDonationRequest;
import com.church.offering.dto.account.PasswordChangeRequest;
import com.church.offering.dto.account.ProfileUpdateRequest;
import com.church.offering.dto.auth.UserView;
import com.church.offering.dto.publicdonation.PublicContributionView;
import com.church.offering.security.UserPrincipal;
import com.church.offering.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/my")
@PreAuthorize("isAuthenticated()")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/donations")
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<PublicContributionView> donate(@Valid @RequestBody MemberDonationRequest request,
                                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.donate(principal, request));
    }

    @GetMapping("/contributions/{id}")
    @PreAuthorize("hasRole('MEMBER')")
    public PublicContributionView contribution(@PathVariable Long id,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        return accountService.contributionDetail(principal, id);
    }

    @PutMapping("/profile")
    public UserView updateProfile(@Valid @RequestBody ProfileUpdateRequest request,
                                  @AuthenticationPrincipal UserPrincipal principal) {
        return accountService.updateProfile(principal, request);
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody PasswordChangeRequest request,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        accountService.changePassword(principal, request);
        return ResponseEntity.noContent().build();
    }
}
