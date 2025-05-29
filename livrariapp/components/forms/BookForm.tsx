import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../constants/Theme';
import { LivroBackend } from '../../constants/Api';

interface BookFormProps {
  initialData?: Partial<LivroBackend>;
  onSubmit: (data: Partial<LivroBackend>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const BookForm = ({ initialData, onSubmit, onCancel, isLoading = false }: BookFormProps) => {
  const [titulo, setTitulo] = useState(initialData?.titulo || '');
  const [autor, setAutor] = useState(initialData?.autor || '');
  const [genero, setGenero] = useState(initialData?.genero || '');
  const [capa, setCapa] = useState(initialData?.capa || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [preco, setPreco] = useState(initialData?.preco?.toString() || '');
  const [codBarrasNum, setCodBarrasNum] = useState(initialData?.codBarrasNum?.toString() || '');
  const [dataPublicacao, setDataPublicacao] = useState<Date>(
    initialData?.dataPublicacao ? new Date(initialData.dataPublicacao) : new Date()
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validação do formulário
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!titulo.trim()) newErrors.titulo = 'O título é obrigatório';
    if (!autor.trim()) newErrors.autor = 'O autor é obrigatório';
    if (!genero.trim()) newErrors.genero = 'O gênero é obrigatório';
    if (!descricao.trim()) newErrors.descricao = 'A descrição é obrigatória';
    
    if (preco) {
      const precoValue = parseFloat(preco.replace(',', '.'));
      if (isNaN(precoValue) || precoValue <= 0) {
        newErrors.preco = 'O preço deve ser um número positivo';
      }
    } else {
      newErrors.preco = 'O preço é obrigatório';
    }
    
    if (codBarrasNum) {
      const codBarrasValue = parseInt(codBarrasNum);
      if (isNaN(codBarrasValue) || codBarrasValue <= 0) {
        newErrors.codBarrasNum = 'O código de barras deve ser um número positivo';
      }
    } else {
      newErrors.codBarrasNum = 'O código de barras é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const bookData: Partial<LivroBackend> = {
        titulo,
        autor,
        genero,
        capa: capa || 'https://via.placeholder.com/150x200?text=No+Cover',
        descricao,
        preco: parseFloat(preco.replace(',', '.')),
        codBarrasNum: parseInt(codBarrasNum),
        dataPublicacao: dataPublicacao.toISOString(),
      };
      
      onSubmit(bookData);
    } else {
      Alert.alert('Formulário inválido', 'Por favor, corrija os erros antes de salvar.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={[styles.input, errors.titulo ? styles.inputError : null]}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Título do livro"
        />
        {errors.titulo && <Text style={styles.errorText}>{errors.titulo}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Autor</Text>
        <TextInput
          style={[styles.input, errors.autor ? styles.inputError : null]}
          value={autor}
          onChangeText={setAutor}
          placeholder="Nome do autor"
        />
        {errors.autor && <Text style={styles.errorText}>{errors.autor}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Gênero</Text>
        <TextInput
          style={[styles.input, errors.genero ? styles.inputError : null]}
          value={genero}
          onChangeText={setGenero}
          placeholder="Gênero literário"
        />
        {errors.genero && <Text style={styles.errorText}>{errors.genero}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>URL da Capa</Text>
        <TextInput
          style={styles.input}
          value={capa}
          onChangeText={setCapa}
          placeholder="https://example.com/book-cover.jpg"
        />
        {capa && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Prévia:</Text>
            <Image 
              source={{ uri: capa }} 
              style={styles.previewImage} 
              onError={() => setCapa('')}
            />
          </View>
        )}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Data de Publicação</Text>
        <TextInput
          style={styles.input}
          value={dataPublicacao.toISOString().split('T')[0]}
          onChangeText={(text) => {
            try {
              const date = new Date(text);
              if (!isNaN(date.getTime())) setDataPublicacao(date);
            } catch (e) {
              // Ignore invalid dates
            }
          }}
          placeholder="YYYY-MM-DD"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={[styles.textArea, errors.descricao ? styles.inputError : null]}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descrição do livro"
          multiline
          numberOfLines={4}
        />
        {errors.descricao && <Text style={styles.errorText}>{errors.descricao}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Preço (R$)</Text>
        <TextInput
          style={[styles.input, errors.preco ? styles.inputError : null]}
          value={preco}
          onChangeText={setPreco}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
        {errors.preco && <Text style={styles.errorText}>{errors.preco}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Código de Barras</Text>
        <TextInput
          style={[styles.input, errors.codBarrasNum ? styles.inputError : null]}
          value={codBarrasNum}
          onChangeText={setCodBarrasNum}
          placeholder="123456789"
          keyboardType="number-pad"
        />
        {errors.codBarrasNum && <Text style={styles.errorText}>{errors.codBarrasNum}</Text>}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.submitButton, isLoading && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Salvando...' : initialData?.id ? 'Atualizar' : 'Adicionar'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Theme.spacing.md,
  },
  formGroup: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.typography.fontSizes.sm,
    fontWeight: '600',
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Theme.colors.tertiary,
    borderRadius: Theme.borderRadius.small,
    padding: Theme.spacing.sm,
    fontSize: Theme.typography.fontSizes.md,
    backgroundColor: Theme.colors.white,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Theme.colors.tertiary,
    borderRadius: Theme.borderRadius.small,
    padding: Theme.spacing.sm,
    fontSize: Theme.typography.fontSizes.md,
    backgroundColor: Theme.colors.white,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Theme.colors.error,
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: Theme.typography.fontSizes.xs,
    marginTop: 4,
  },
  previewContainer: {
    marginTop: Theme.spacing.xs,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: Theme.typography.fontSizes.xs,
    color: Theme.colors.secondary,
    marginBottom: 4,
  },
  previewImage: {
    width: 100,
    height: 150,
    borderRadius: Theme.borderRadius.small,
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  button: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Theme.spacing.xs,
  },
  cancelButton: {
    backgroundColor: Theme.colors.tertiary,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: Theme.colors.white,
    fontSize: Theme.typography.fontSizes.md,
    fontWeight: '600',
  },
});

export default BookForm;
