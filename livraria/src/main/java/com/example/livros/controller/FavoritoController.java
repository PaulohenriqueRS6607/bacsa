package com.example.livros.controller;

import com.example.livros.entities.Favorito;
import com.example.livros.service.FavoritoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/favoritos")
@CrossOrigin(origins = "*")
@Tag(name = "Favoritos", description = "Operações relacionadas a favoritos de livros do Google Books")
public class FavoritoController {

    @Autowired
    private FavoritoService favoritoService;

    @Operation(summary = "Busca todos os favoritos de um dispositivo")
    @GetMapping("/device/{deviceId}")
    public ResponseEntity<List<Favorito>> findByDevice(@PathVariable String deviceId) {
        List<Favorito> favoritos = favoritoService.findByDevice(deviceId);
        return ResponseEntity.ok(favoritos);
    }

    @Operation(summary = "Verifica se um livro do Google Books é favorito para um dispositivo")
    @GetMapping("/check")
    public ResponseEntity<Boolean> isLivroFavorito(
            @RequestParam String deviceId, 
            @RequestParam String googleBooksId) {
        boolean isFavorito = favoritoService.isLivroFavorito(deviceId, googleBooksId);
        return ResponseEntity.ok(isFavorito);
    }

    @Operation(summary = "Adiciona um livro do Google Books aos favoritos")
    @PostMapping
    public ResponseEntity<?> adicionarFavorito(@RequestBody Map<String, String> payload) {
        String deviceId = payload.get("deviceId");
        String googleBooksId = payload.get("googleBooksId");
        String titulo = payload.get("titulo");
        String autor = payload.get("autor");
        String imagemUrl = payload.get("imagemUrl");
        String descricao = payload.get("descricao");
        String dataPublicacao = payload.get("dataPublicacao");
        
        if (deviceId == null || googleBooksId == null || titulo == null) {
            return ResponseEntity.badRequest().body("deviceId, googleBooksId e titulo são obrigatórios");
        }
        
        try {
            Favorito favorito = favoritoService.adicionarFavorito(
                deviceId, googleBooksId, titulo, autor, imagemUrl, descricao, dataPublicacao);
            return ResponseEntity.status(HttpStatus.CREATED).body(favorito);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Operation(summary = "Remove um livro do Google Books dos favoritos")
    @DeleteMapping
    public ResponseEntity<?> removerFavorito(
            @RequestParam String deviceId, 
            @RequestParam String googleBooksId) {
        try {
            favoritoService.removerFavorito(deviceId, googleBooksId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Operation(summary = "Busca um favorito por ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> findById(@PathVariable Long id) {
        Optional<Favorito> favorito = favoritoService.findById(id);
        return favorito.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Remove um favorito por ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            favoritoService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
