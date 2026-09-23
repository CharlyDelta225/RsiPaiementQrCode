package com.church.offering.service;

import com.church.offering.dto.auth.UserView;
import com.church.offering.dto.user.StaffRequest;
import com.church.offering.model.Temple;
import com.church.offering.model.User;
import com.church.offering.model.enums.Role;
import com.church.offering.repository.TempleRepository;
import com.church.offering.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final TempleRepository templeRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserService(UserRepository userRepository,
                            TempleRepository templeRepository,
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.templeRepository = templeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserView> listByRole(Role role) {
        if (role == null) {
            return userRepository.findAll().stream().map(UserView::from).toList();
        }
        return userRepository.findByRole(role).stream().map(UserView::from).toList();
    }

    @Transactional
    public UserView createStaff(StaffRequest request) {
        if (request.role() == Role.MEMBER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le rôle MEMBER est géré par l'inscription publique");
        }
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un compte existe déjà avec cet email");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(request.phone());
        user.setRole(request.role());
        user.setActive(true);
        if (request.templeId() != null) {
            user.setTemple(findTemple(request.templeId()));
        }
        return UserView.from(userRepository.save(user));
    }

    @Transactional
    public UserView setActive(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));
        user.setActive(active);
        return UserView.from(userRepository.save(user));
    }

    private Temple findTemple(Long id) {
        return templeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Temple inconnu"));
    }
}