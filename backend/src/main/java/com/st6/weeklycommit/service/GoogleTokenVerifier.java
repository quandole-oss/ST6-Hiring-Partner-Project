package com.st6.weeklycommit.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

@Service
public class GoogleTokenVerifier {

    private final String clientId;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleTokenVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId;
    }

    public record GoogleUser(String googleId, String email, String name, String pictureUrl) {}

    public GoogleUser verify(String idToken) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new IllegalArgumentException("Invalid Google token");
            }

            JsonNode json = objectMapper.readTree(response.body());

            String aud = json.get("aud").asText();
            if (!clientId.equals(aud)) {
                throw new IllegalArgumentException("Token audience mismatch");
            }

            return new GoogleUser(
                    json.get("sub").asText(),
                    json.get("email").asText(),
                    json.has("name") ? json.get("name").asText() : json.get("email").asText(),
                    json.has("picture") ? json.get("picture").asText() : null
            );
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to verify Google token", e);
        }
    }
}
