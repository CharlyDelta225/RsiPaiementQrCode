package com.church.offering.service;

import com.church.offering.dto.temple.TempleRequest;
import com.church.offering.dto.temple.TempleView;
import com.church.offering.model.Church;
import com.church.offering.model.Temple;
import com.church.offering.repository.ChurchRepository;
import com.church.offering.repository.TempleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TempleService {

    private final TempleRepository templeRepository;
    private final ChurchRepository churchRepository;

    public TempleService(TempleRepository templeRepository, ChurchRepository churchRepository) {
        this.templeRepository = templeRepository;
        this.churchRepository = churchRepository;
    }

    @Transactional(readOnly = true)
    public List<TempleView> list() {
        return templeRepository.findAll().stream().map(TempleView::from).toList();
    }

    @Transactional(readOnly = true)
    public TempleView get(Long id) {
        return TempleView.from(findTemple(id));
    }

    @Transactional
    public TempleView create(TempleRequest request) {
        Church church = currentChurch();
        ensureUniqueName(church.getId(), request.name(), null);

        Temple temple = new Temple();
        apply(temple, request);
        temple.setChurch(church);
        return TempleView.from(templeRepository.save(temple));
    }

    @Transactional
    public TempleView update(Long id, TempleRequest request) {
        Temple temple = findTemple(id);
        ensureUniqueName(temple.getChurch().getId(), request.name(), id);

        apply(temple, request);
        return TempleView.from(templeRepository.save(temple));
    }

    private void apply(Temple temple, TempleRequest request) {
        temple.setName(request.name().trim());
        temple.setCity(request.city());
        temple.setAddress(request.address());
        temple.setActive(request.active());
    }

    private void ensureUniqueName(Long churchId, String name, Long exceptId) {
        boolean exists = exceptId == null
                ? templeRepository.existsByChurchIdAndName(churchId, name)
                : templeRepository.existsByChurchIdAndNameAndIdNot(churchId, name, exceptId);
        if (exists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Un temple de l'église porte déjà ce nom");
        }
    }

    private Temple findTemple(Long id) {
        return templeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Temple introuvable"));
    }

    private Church currentChurch() {
        return churchRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Aucune église configurée"));
    }
}