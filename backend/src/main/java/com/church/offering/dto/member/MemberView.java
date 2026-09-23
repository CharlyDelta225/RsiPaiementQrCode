package com.church.offering.dto.member;

import com.church.offering.model.Member;

public record MemberView(
        Long id,
        String fullName,
        String phone,
        String email,
        Long templeId,
        String templeName,
        Long userId,
        boolean active) {

    public static MemberView from(Member member) {
        return new MemberView(
                member.getId(),
                member.getFullName(),
                member.getPhone(),
                member.getEmail(),
                member.getTemple().getId(),
                member.getTemple().getName(),
                member.getUser() != null ? member.getUser().getId() : null,
                member.isActive());
    }
}