package com.example.livros.service;

import com.example.livros.entities.Favorito;
import com.example.livros.repository.FavoritoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class FavoritoService {

    @Autowired
    private FavoritoRepository favoritoRepository;

    /**
     * Busca todos os favoritos de um dispositivo
     */
    @Transactional(readOnly = true)
    public List<Favorito> findByDevice(String deviceId) {
        return favoritoRepository.findByDeviceId(deviceId);
    }

    /**
     * Verifica se um livro do Google Books já está nos favoritos do dispositivo
     */
    @Transactional(readOnly = true)
    public boolean isLivroFavorito(String deviceId, String googleBooksId) {
        return favoritoRepository.existsByDeviceIdAndGoogleBooksId(deviceId, googleBooksId);
    }

    /**
     * Adiciona um livro do Google Books aos favoritos do dispositivo
     */
    @Transactional
    public Favorito adicionarFavorito(String deviceId, String googleBooksId, String titulo, 
                                     String autor, String imagemUrl, String descricao, String dataPublicacao) {
        
        // Verificar se já existe
        Optional<Favorito> favoritoExistente = favoritoRepository.findByDeviceIdAndGoogleBooksId(deviceId, googleBooksId);
        if (favoritoExistente.isPresent()) {
            return favoritoExistente.get(); // Já está nos favoritos
        }
        
        // Criar novo favorito
        Favorito favorito = new Favorito(deviceId, googleBooksId, titulo, autor, imagemUrl, descricao, dataPublicacao);
        return favoritoRepository.save(favorito);
    }

    /**
     * Remove um livro do Google Books dos favoritos do dispositivo
     */
    @Transactional
    public void removerFavorito(String deviceId, String googleBooksId) {
        Optional<Favorito> favorito = favoritoRepository.findByDeviceIdAndGoogleBooksId(deviceId, googleBooksId);
        
        if (favorito.isPresent()) {
            favoritoRepository.delete(favorito.get());
        } else {
            throw new RuntimeException("Favorito não encontrado para este dispositivo e livro");
        }
    }

    /**
     * Busca todos os favoritos
     */
    @Transactional(readOnly = true)
    public List<Favorito> findAll() {
        return favoritoRepository.findAll();
    }

    /**
     * Busca um favorito específico por ID
     */
    @Transactional(readOnly = true)
    public Optional<Favorito> findById(Long id) {
        return favoritoRepository.findById(id);
    }

    /**
     * Remove um favorito por ID
     */
    @Transactional
    public void delete(Long id) {
        if (favoritoRepository.existsById(id)) {
            favoritoRepository.deleteById(id);
        } else {
            throw new RuntimeException("Favorito não encontrado com ID: " + id);
        }
    }
}
