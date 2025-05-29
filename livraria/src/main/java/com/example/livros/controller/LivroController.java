package com.example.livros.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.livros.dto.LivroDTO;
import com.example.livros.entities.Livro;
import com.example.livros.service.LivroService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/livros")
@CrossOrigin(origins = "*")
@Tag(name = "Livros", description = "Operações relacionadas aos livros e favoritos")
public class LivroController {

    @Autowired
    private LivroService livroService;

    @Operation(summary = "Cria um novo livro")
    @PostMapping
    public LivroDTO criarLivro(@RequestBody LivroDTO livroDTO) {
        return livroService.criarLivro(livroDTO);
    }

    @Operation(summary = "Lista todos os livros")
    @GetMapping
    public List<LivroDTO> listarLivros() {
        return livroService.listarLivros();
    }

    @Operation(summary = "Busca um livro por ID")
    @GetMapping("/{id}")
    public ResponseEntity<LivroDTO> buscarLivroPorId(@PathVariable Long id) {
        Optional<LivroDTO> livroDTO = livroService.buscarLivroPorId(id);
        return livroDTO.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(summary = "Atualiza um livro por ID")
    @PutMapping("/{id}")
    public ResponseEntity<LivroDTO> atualizarLivro(@PathVariable Long id, @RequestBody LivroDTO livroDTO) {
        LivroDTO updatedLivroDTO = livroService.atualizarLivro(id, livroDTO);
        if (updatedLivroDTO != null) {
            return ResponseEntity.ok(updatedLivroDTO);
        }
        return ResponseEntity.notFound().build();
    }

    @Operation(summary = "Deleta um livro por ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarLivro(@PathVariable Long id) {
        livroService.deletarLivro(id);
        return ResponseEntity.noContent().build();
    }
    
    // ========== Endpoints para gerenciar favoritos ==========
    
    @Operation(summary = "Busca todos os favoritos de um dispositivo")
    @GetMapping("/favoritos/device/{deviceId}")
    public ResponseEntity<List<Livro>> findByDevice(@PathVariable String deviceId) {
        List<Livro> favoritos = livroService.findByDevice(deviceId);
        return ResponseEntity.ok(favoritos);
    }

    @Operation(summary = "Verifica se um livro do Google Books é favorito para um dispositivo")
    @GetMapping("/favoritos/check")
    public ResponseEntity<Boolean> isLivroFavorito(
            @RequestParam String deviceId, 
            @RequestParam String googleBooksId) {
        boolean isFavorito = livroService.isLivroFavorito(deviceId, googleBooksId);
        return ResponseEntity.ok(isFavorito);
    }

    @Operation(summary = "Adiciona um livro do Google Books aos favoritos")
    @PostMapping("/favoritos")
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
            Livro livro = livroService.adicionarFavorito(
                deviceId, googleBooksId, titulo, autor, imagemUrl, descricao, dataPublicacao);
            return ResponseEntity.status(HttpStatus.CREATED).body(livro);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @Operation(summary = "Remove um livro do Google Books dos favoritos")
    @DeleteMapping("/favoritos")
    public ResponseEntity<?> removerFavorito(
            @RequestParam String deviceId, 
            @RequestParam String googleBooksId) {
        try {
            livroService.removerFavorito(deviceId, googleBooksId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    
    @Operation(summary = "Busca livros por título ou autor")
    @GetMapping("/busca")
    public ResponseEntity<List<Livro>> buscarPorTituloOuAutor(@RequestParam(required = false) String query) {
        List<Livro> livros = livroService.buscarPorTituloOuAutor(query);
        return ResponseEntity.ok(livros);
    }
}
