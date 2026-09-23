package com.church.offering.service;

import com.church.offering.dto.auth.AuthResponse;
import com.church.offering.dto.auth.LoginRequest;
import com.church.offering.dto.auth.RegisterRequest;
import com.church.offering.dto.auth.UserView;
import com.church.offering.model.Member;
import com.church.offering.model.Temple;
import com.church.offering.model.User;
import com.church.offering.model.enums.Role;
import com.church.offering.repository.MemberRepository;
import com.church.offering.repository.TempleRepository;
import com.church.offering.repository.UserRepository;
import com.church.offering.security.JwtService;
import com.church.offering.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final TempleRepository templeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       MemberRepository memberRepository,
                       TempleRepository templeRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.templeRepository = templeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }
        if (memberRepository.existsByPhone(request.phone())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce numéro de téléphone est déjà utilisé");
        }
        Temple temple = templeRepository.findById(request.templeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Temple inconnu"));

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone());
        user.setRole(Role.MEMBER);
        user.setTemple(temple);
        user.setActive(true);
        user = userRepository.save(user);

        Member member = new Member();
        member.setFullName(user.getFirstName() + " " + user.getLastName());
        member.setPhone(user.getPhone());
        member.setEmail(user.getEmail());
        member.setTemple(temple);
        member.setUser(user);
        memberRepository.save(member);

        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants invalides"));
        return buildAuthResponse(user);
    }

    public UserView me(UserPrincipal principal) {
        return UserView.from(principal.user());
    }

    private AuthResponse buildAuthResponse(User user) {
        UserPrincipal principal = new UserPrincipal(user);
        return new AuthResponse(jwtService.generateToken(principal), UserView.from(user));
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}