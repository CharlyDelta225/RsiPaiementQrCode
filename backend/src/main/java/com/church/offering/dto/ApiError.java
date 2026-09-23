package com.church.offering.dto;

import java.util.Map;

public record ApiError(int status, String error, Map<String, String> details) {
}