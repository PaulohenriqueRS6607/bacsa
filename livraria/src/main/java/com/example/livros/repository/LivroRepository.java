package com.example.livros.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.livros.entities.Livro;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {
    // Métodos para gerenciar livros como favoritos
    
    // Buscar por deviceId (identificador do dispositivo/usuário)
    List<Livro> findByDeviceIdAndFavoritoTrue(String deviceId);
    
    // Buscar por ID do Google Books
    List<Livro> findByGoogleBooksId(String googleBooksId);
    
    // Verificar se já existe um favorito para este dispositivo e livro
    boolean existsByDeviceIdAndGoogleBooksIdAndFavoritoTrue(String deviceId, String googleBooksId);
    
    // Buscar livro específico por deviceId e googleBooksId
    Optional<Livro> findByDeviceIdAndGoogleBooksIdAndFavoritoTrue(String deviceId, String googleBooksId);
    
    // Buscar por título contendo o texto da busca (case insensitive)
    List<Livro> findByTituloContainingIgnoreCase(String titulo);
    
    // Buscar por autor contendo o texto da busca (case insensitive)
    List<Livro> findByAutorContainingIgnoreCase(String autor);
    
    // Buscar por título ou autor contendo o texto da busca (case insensitive)
    @Query("SELECT l FROM Livro l WHERE LOWER(l.titulo) LIKE LOWER(CONCAT('%', ?1, '%')) OR LOWER(l.autor) LIKE LOWER(CONCAT('%', ?1, '%'))")
    List<Livro> findByTituloOrAutorContainingIgnoreCase(String busca);
}