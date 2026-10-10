package com.church.offering.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Anti-spam minimal : nombre de POST par adresse IP et par minute sur les routes publiques
 * sensibles (connexion, inscription, don public). En mémoire : suffisant pour un seul serveur.
 * Derrière un reverse proxy, activer `server.forward-headers-strategy=native` pour obtenir
 * la vraie IP du client.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final long WINDOW_MILLIS = 60_000;
    private static final int MAX_TRACKED_KEYS = 10_000;

    private final boolean enabled;
    private final int loginPerMinute;
    private final int registerPerMinute;
    private final int publicPerMinute;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    public RateLimitFilter(@Value("${app.rate-limit.enabled:true}") boolean enabled,
                           @Value("${app.rate-limit.login-per-minute:20}") int loginPerMinute,
                           @Value("${app.rate-limit.register-per-minute:10}") int registerPerMinute,
                           @Value("${app.rate-limit.public-per-minute:60}") int publicPerMinute) {
        this.enabled = enabled;
        this.loginPerMinute = loginPerMinute;
        this.registerPerMinute = registerPerMinute;
        this.publicPerMinute = publicPerMinute;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !enabled || !"POST".equals(request.getMethod()) || limitFor(request.getRequestURI()) == 0;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String uri = request.getRequestURI();
        String key = bucket(uri) + '|' + request.getRemoteAddr();
        long now = System.currentTimeMillis();
        if (windows.size() > MAX_TRACKED_KEYS) {
            windows.values().removeIf(window -> now - window.start >= WINDOW_MILLIS);
        }
        Window window = windows.compute(key, (k, current) ->
                current == null || now - current.start >= WINDOW_MILLIS ? new Window(now) : current.increment());

        if (window.count > limitFor(uri)) {
            long retryAfter = Math.max(1, (WINDOW_MILLIS - (now - window.start)) / 1000);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setHeader("Retry-After", String.valueOf(retryAfter));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"status\":429,\"error\":\"Trop de tentatives. Réessayez dans "
                    + retryAfter + " secondes.\",\"details\":null}");
            return;
        }
        chain.doFilter(request, response);
    }

    private int limitFor(String uri) {
        return switch (bucket(uri)) {
            case "login" -> loginPerMinute;
            case "register" -> registerPerMinute;
            case "public" -> publicPerMinute;
            default -> 0;
        };
    }

    private static String bucket(String uri) {
        if (uri.equals("/api/auth/login")) {
            return "login";
        }
        if (uri.equals("/api/auth/register")) {
            return "register";
        }
        if (uri.startsWith("/api/public/")) {
            return "public";
        }
        return "";
    }

    private static final class Window {
        private final long start;
        private final int count;

        private Window(long start) {
            this(start, 1);
        }

        private Window(long start, int count) {
            this.start = start;
            this.count = count;
        }

        private Window increment() {
            return new Window(start, count + 1);
        }
    }
}
