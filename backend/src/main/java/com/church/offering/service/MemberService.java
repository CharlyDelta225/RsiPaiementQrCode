package com.church.offering.service;

import com.church.offering.dto.member.MemberRequest;
import com.church.offering.dto.member.MemberView;
import com.church.offering.model.Member;
import com.church.offering.model.Temple;
import com.church.offering.repository.MemberRepository;
import com.church.offering.repository.TempleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;
    private final TempleRepository templeRepository;

    public MemberService(MemberRepository memberRepository, TempleRepository templeRepository) {
        this.memberRepository = memberRepository;
        this.templeRepository = templeRepository;
    }

    @Transactional(readOnly = true)
    public List<MemberView> list(String search, Long templeId) {
        if (search != null && !search.isBlank()) {
            String term = search.trim();
            return memberRepository
                    .findByFullNameContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrderByFullNameAsc(term, term)
                    .stream().map(MemberView::from).toList();
        }
        if (templeId != null) {
            return memberRepository.findByTempleIdOrderByFullNameAsc(templeId)
                    .stream().map(MemberView::from).toList();
        }
        return memberRepository.findAllByOrderByFullNameAsc().stream().map(MemberView::from).toList();
    }

    @Transactional(readOnly = true)
    public MemberView get(Long id) {
        return MemberView.from(findMember(id));
    }

    @Transactional
    public MemberView create(MemberRequest request) {
        ensureUniquePhone(request.phone(), null);

        Member member = new Member();
        apply(member, request);
        return MemberView.from(memberRepository.save(member));
    }

    @Transactional
    public MemberView update(Long id, MemberRequest request) {
        Member member = findMember(id);
        ensureUniquePhone(request.phone(), id);

        apply(member, request);
        return MemberView.from(memberRepository.save(member));
    }

    private void apply(Member member, MemberRequest request) {
        member.setFullName(request.fullName().trim());
        member.setPhone(request.phone());
        member.setEmail(request.email());
        member.setTemple(findTemple(request.templeId()));
        member.setActive(request.active());
    }

    private void ensureUniquePhone(String phone, Long exceptId) {
        memberRepository.findByPhone(phone).ifPresent(existing -> {
            if (exceptId == null || !existing.getId().equals(exceptId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ce numéro de téléphone est déjà utilisé");
            }
        });
    }

    private Member findMember(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membre introuvable"));
    }

    private Temple findTemple(Long id) {
        return templeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Temple inconnu"));
    }
}