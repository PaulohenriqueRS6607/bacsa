package com.example.livros.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.livros.dto.LivroDTO;
import com.example.livros.entities.Livro;
import com.example.livros.repository.LivroRepository;

@Service
public class LivroService {

    @Autowired
    private LivroRepository livroRepository;

    // DTO para Entidade
    private Livro toEntity(LivroDTO dto) {
        Livro livro = new Livro();
        livro.setId(dto.getId());
        livro.setTitulo(dto.getTitulo());
        livro.setAutor(dto.getAutor());
        livro.setGenero(dto.getGenero());
        livro.setCapa(dto.getCapa());
        livro.setDataPublicacao(dto.getDataPublicacao());
        livro.setDescricao(dto.getDescricao());
        return livro;
    }

    // Entidade para DTO
    private LivroDTO toDTO(Livro livro) {
        LivroDTO dto = new LivroDTO();
        dto.setId(livro.getId());
        dto.setTitulo(livro.getTitulo());
        dto.setAutor(livro.getAutor());
        dto.setGenero(livro.getGenero());
        dto.setCapa(livro.getCapa());
        dto.setDataPublicacao(livro.getDataPublicacao());
        dto.setDescricao(livro.getDescricao());
        return dto;
    }

    // Create
    public LivroDTO criarLivro(LivroDTO livroDTO) {
        Livro livro = toEntity(livroDTO);
        Livro savedLivro = livroRepository.save(livro);
        return toDTO(savedLivro);
    }

    // Read (todos)
    public List<LivroDTO> listarLivros() {
        return livroRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Read (por ID)
    public Optional<LivroDTO> buscarLivroPorId(Long id) {
        return livroRepository.findById(id).map(this::toDTO);
    }

    // Update
    public LivroDTO atualizarLivro(Long id, LivroDTO livroDTO) {
        Optional<Livro> livroExistente = livroRepository.findById(id);
        if (livroExistente.isPresent()) {
            Livro livro = livroExistente.get();
            livro.setTitulo(livroDTO.getTitulo());
            livro.setAutor(livroDTO.getAutor());
            livro.setGenero(livroDTO.getGenero());
            livro.setCapa(livroDTO.getCapa());
            livro.setDataPublicacao(livroDTO.getDataPublicacao());
            livro.setDescricao(livroDTO.getDescricao());
            Livro updatedLivro = livroRepository.save(livro);
            return toDTO(updatedLivro);
        }
        return null;
    }

    // Delete
    public void deletarLivro(Long id) {
        livroRepository.deleteById(id);
    }
    
    // ========== Métodos para gerenciar favoritos ==========
    
    /**
     * Busca todos os livros favoritos de um dispositivo
     */
    @Transactional(readOnly = true)
    public List<Livro> findByDevice(String deviceId) {
        return livroRepository.findByDeviceIdAndFavoritoTrue(deviceId);
    }

    /**
     * Verifica se um livro do Google Books já está nos favoritos do dispositivo
     */
    @Transactional(readOnly = true)
    public boolean isLivroFavorito(String deviceId, String googleBooksId) {
        return livroRepository.existsByDeviceIdAndGoogleBooksIdAndFavoritoTrue(deviceId, googleBooksId);
    }

    /**
     * Adiciona um livro do Google Books aos favoritos do dispositivo
     */
    @Transactional
    public Livro adicionarFavorito(String deviceId, String googleBooksId, String titulo, 
                                 String autor, String imagemUrl, String descricao, String dataPublicacao) {
        
        // Verificar se já existe
        Optional<Livro> livroExistente = livroRepository.findByDeviceIdAndGoogleBooksIdAndFavoritoTrue(deviceId, googleBooksId);
        if (livroExistente.isPresent()) {
            return livroExistente.get(); // Já está nos favoritos
        }
        
        // Criar novo livro favorito
        Livro livro = new Livro(deviceId, googleBooksId, titulo, autor, imagemUrl, descricao, dataPublicacao);
        return livroRepository.save(livro);
    }

    /**
     * Remove um livro do Google Books dos favoritos do dispositivo
     */
    @Transactional
    public void removerFavorito(String deviceId, String googleBooksId) {
        Optional<Livro> livro = livroRepository.findByDeviceIdAndGoogleBooksIdAndFavoritoTrue(deviceId, googleBooksId);
        
        if (livro.isPresent()) {
            Livro livroFavorito = livro.get();
            livroFavorito.setFavorito(false);
            livroRepository.save(livroFavorito);
        } else {
            throw new RuntimeException("Favorito não encontrado para este dispositivo e livro");
        }
    }
    
    /**
     * Busca livros por título ou autor
     */
    @Transactional(readOnly = true)
    public List<Livro> buscarPorTituloOuAutor(String busca) {
        if (busca == null || busca.trim().isEmpty()) {
            return livroRepository.findAll();
        }
        return livroRepository.findByTituloOrAutorContainingIgnoreCase(busca.trim());
    }
}