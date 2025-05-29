package com.example.livros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

import com.example.livros.entities.Favorito;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    // Buscar por deviceId (identificador do dispositivo/usuário)
    List<Favorito> findByDeviceId(String deviceId);
    
    // Buscar por ID do Google Books
    List<Favorito> findByGoogleBooksId(String googleBooksId);
    
    // Verificar se já existe um favorito para este dispositivo e livro
    boolean existsByDeviceIdAndGoogleBooksId(String deviceId, String googleBooksId);
    
    // Buscar favorito específico por deviceId e googleBooksId
    Optional<Favorito> findByDeviceIdAndGoogleBooksId(String deviceId, String googleBooksId);
    
    // Deletar por deviceId e googleBooksId
    void deleteByDeviceIdAndGoogleBooksId(String deviceId, String googleBooksId);
}
