package com.church.offering.config;

import com.church.offering.model.Church;
import com.church.offering.model.Member;
import com.church.offering.model.OfferingType;
import com.church.offering.model.Temple;
import com.church.offering.model.User;
import com.church.offering.model.enums.Role;
import com.church.offering.repository.ChurchRepository;
import com.church.offering.repository.MemberRepository;
import com.church.offering.repository.OfferingTypeRepository;
import com.church.offering.repository.TempleRepository;
import com.church.offering.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ChurchRepository churchRepository;
    private final TempleRepository templeRepository;
    private final OfferingTypeRepository offeringTypeRepository;
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean demoUsers;
    private final String adminEmail;
    private final String adminPassword;

    public DataSeeder(ChurchRepository churchRepository,
                      TempleRepository templeRepository,
                      OfferingTypeRepository offeringTypeRepository,
                      UserRepository userRepository,
                      MemberRepository memberRepository,
                      PasswordEncoder passwordEncoder,
                      @Value("${app.seed.demo-users:false}") boolean demoUsers,
                      @Value("${ADMIN_EMAIL:}") String adminEmail,
                      @Value("${ADMIN_PASSWORD:}") String adminPassword) {
        this.churchRepository = churchRepository;
        this.templeRepository = templeRepository;
        this.offeringTypeRepository = offeringTypeRepository;
        this.userRepository = userRepository;
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.demoUsers = demoUsers;
        this.adminEmail = adminEmail == null ? "" : adminEmail.trim().toLowerCase();
        this.adminPassword = adminPassword == null ? "" : adminPassword;
    }

    @Override
    @Transactional
    public void run(String... args) {
        bootstrapAdmin();
        if (churchRepository.count() > 0) {
            return;
        }

        Church church = new Church();
        church.setName("Église RSI");
        church.setSlogan("Servir et donner avec joie");
        church.setCurrencyCode("XOF");
        church.setCurrencySymbol("FCFA");
        church.setCountry("Côte d'Ivoire");
        church.setActive(true);
        church = churchRepository.save(church);

        Temple templeAbidjan = saveTemple(church, "Temple de la Victoire", "Abidjan", "Cocody, Riviera");
        Temple templeYamoussoukro = saveTemple(church, "Temple de la Foi", "Yamoussoukro", "Quartier Habitat");
        List<Temple> temples = templeRepository.saveAll(List.of(templeAbidjan, templeYamoussoukro));

        offeringTypeRepository.saveAll(List.of(
                offeringType("DIME", "Dîme", "La dîme : 10% des revenus", 1,
                        "Apportez toutes les dîmes à la maison du trésor, et vous en aurez à manger dans ma maison.",
                        "Malachie 3:10"),
                offeringType("OFFRANDE_CULTE", "Offrande du culte", "Offrande lors du culte", 2,
                        "Adoptez la sainteté dans la maison de l'Éternel, dans la maison de notre Dieu.",
                        "Psaume 96:8"),
                offeringType("PREMICE", "Prémices", "Prémices du mois", 3,
                        "Que l'Éternel vous bénisse comme il vous l'a promis, et vous posséderez longuement ce pays.",
                        "Deutéronome 11:25"),
                offeringType("DON", "Don", "Don libre", 4,
                        "Que chacun donne selon sa volonté, et non de mauvaise grâce, car Dieu aime celui qui donne avec joie.",
                        "2 Corinthiens 9:7")));

        if (!demoUsers) {
            log.info("=== Église, temples et types d'offrande initialisés (sans comptes de démo) ===");
            return;
        }

        User admin = new User();
        admin.setEmail("admin@rsi.local");
        admin.setPasswordHash(passwordEncoder.encode("Admin@12345"));
        admin.setFirstName("Admin");
        admin.setLastName("RSI");
        admin.setPhone("+2250700000000");
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);

        User memberUser = new User();
        memberUser.setEmail("membre@rsi.local");
        memberUser.setPasswordHash(passwordEncoder.encode("Membre@12345"));
        memberUser.setFirstName("Jean");
        memberUser.setLastName("Kouassi");
        memberUser.setPhone("+2250700000001");
        memberUser.setRole(Role.MEMBER);
        memberUser.setTemple(temples.get(0));
        memberUser.setActive(true);
        memberUser = userRepository.save(memberUser);

        Member member = new Member();
        member.setFullName("Jean Kouassi");
        member.setPhone(memberUser.getPhone());
        member.setEmail(memberUser.getEmail());
        member.setTemple(temples.get(0));
        member.setUser(memberUser);
        memberRepository.save(member);

        saveStaff("tresorier@rsi.local", "Tresorier@12345", "Aminata", "Touré",
                "+2250700000002", Role.TREASURER, temples.get(0));
        saveStaff("pasteur@rsi.local", "Pasteur@12345", "David", "Bamba",
                "+2250700000003", Role.PASTEUR, temples.get(0));

        log.info("=== Seed initialisé (dev) ===");
        log.info("Admin : admin@rsi.local / Admin@12345");
        log.info("Membre : membre@rsi.local / Membre@12345");
        log.info("Trésorier : tresorier@rsi.local / Tresorier@12345");
        log.info("Pasteur : pasteur@rsi.local / Pasteur@12345");
    }

    private void saveStaff(String email, String password, String firstName, String lastName,
                           String phone, Role role, Temple temple) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        user.setRole(role);
        user.setTemple(temple);
        user.setActive(true);
        userRepository.save(user);
    }

    /**
     * Production : crée le premier administrateur à partir d'ADMIN_EMAIL / ADMIN_PASSWORD
     * (une seule fois, si aucun compte n'existe avec cet email).
     */
    private void bootstrapAdmin() {
        if (adminEmail.isBlank() || adminPassword.isBlank() || userRepository.existsByEmail(adminEmail)) {
            return;
        }
        if (adminPassword.length() < 12) {
            log.warn("ADMIN_PASSWORD trop court (12 caractères minimum) : administrateur non créé.");
            return;
        }
        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setFirstName("Administrateur");
        admin.setLastName("RSI");
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        userRepository.save(admin);
        log.info("Administrateur initial créé : {}", adminEmail);
    }

    private Temple saveTemple(Church church, String name, String city, String address) {
        Temple temple = new Temple();
        temple.setName(name);
        temple.setCity(city);
        temple.setAddress(address);
        temple.setChurch(church);
        temple.setActive(true);
        return temple;
    }

    private OfferingType offeringType(String code, String label, String description, int sortOrder,
                                      String blessingText, String blessingRef) {
        OfferingType type = new OfferingType();
        type.setCode(code);
        type.setLabel(label);
        type.setDescription(description);
        type.setBlessingText(blessingText);
        type.setBlessingRef(blessingRef);
        type.setSortOrder(sortOrder);
        type.setActive(true);
        return type;
    }
}