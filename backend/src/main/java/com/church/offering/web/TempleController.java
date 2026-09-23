package com.church.offering.web;

import com.church.offering.dto.temple.TempleRequest;
import com.church.offering.dto.temple.TempleView;
import com.church.offering.service.TempleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/temples")
public class TempleController {

    private final TempleService templeService;

    public TempleController(TempleService templeService) {
        this.templeService = templeService;
    }

    @GetMapping
    public List<TempleView> list() {
        return templeService.list();
    }

    @GetMapping("/{id}")
    public TempleView get(@PathVariable Long id) {
        return templeService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TempleView> create(@Valid @RequestBody TempleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(templeService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public TempleView update(@PathVariable Long id, @Valid @RequestBody TempleRequest request) {
        return templeService.update(id, request);
    }
}