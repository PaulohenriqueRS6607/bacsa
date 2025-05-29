// Dados mockados para evitar erros de "too many requests" na API do Google Books
export interface MockBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    categories?: string[];
  };
}

// Livros de Fantasia
export const fantasyBooks: MockBookItem[] = [
  {
    id: 'fantasy1',
    volumeInfo: {
      title: 'Harry Potter e a Pedra Filosofal',
      authors: ['J.K. Rowling'],
      description: 'Harry Potter nunca tinha ouvido falar em Hogwarts até o momento em que as CARTAS começam a aparecer no capacho do número 4 da rua dos Alfeneiros.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/10110415-L.jpg'
      },
      publishedDate: '1997',
      categories: ['Fantasy', 'Young Adult']
    }
  },
  {
    id: 'fantasy2',
    volumeInfo: {
      title: 'O Senhor dos Anéis: A Sociedade do Anel',
      authors: ['J.R.R. Tolkien'],
      description: 'Em uma terra fantástica e única, um hobbit recebe de presente de seu tio um anel mágico e perigoso que precisa ser destruído antes que caia nas mãos do mal.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8743225-L.jpg'
      },
      publishedDate: '1954',
      categories: ['Fantasy', 'Classic']
    }
  },
  {
    id: 'fantasy3',
    volumeInfo: {
      title: 'As Crônicas de Nárnia',
      authors: ['C.S. Lewis'],
      description: 'Quatro crianças descobrem um guarda-roupa que serve como porta de entrada para o mundo mágico de Nárnia.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8237627-L.jpg'
      },
      publishedDate: '1950',
      categories: ['Fantasy', 'Children']
    }
  }
];

// Livros de Ação
export const actionBooks: MockBookItem[] = [
  {
    id: 'action1',
    volumeInfo: {
      title: 'Jogos Vorazes',
      authors: ['Suzanne Collins'],
      description: 'Em uma versão sombria do futuro próximo, doze garotos e doze garotas são forçados a participar dos Jogos Vorazes. Apenas um sairá vencedor.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/6943361-L.jpg'
      },
      publishedDate: '2008',
      categories: ['Action', 'Dystopian']
    }
  },
  {
    id: 'action2',
    volumeInfo: {
      title: 'Divergente',
      authors: ['Veronica Roth'],
      description: 'Em uma Chicago futurista, a sociedade é dividida em cinco facções. Tris Prior faz uma escolha que surpreende a todos, inclusive a ela mesma.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/7095688-L.jpg'
      },
      publishedDate: '2011',
      categories: ['Action', 'Dystopian']
    }
  },
  {
    id: 'action3',
    volumeInfo: {
      title: 'O Código Da Vinci',
      authors: ['Dan Brown'],
      description: 'Um assassinato no museu do Louvre e pistas em pinturas famosas levam à descoberta de um mistério religioso.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/7895635-L.jpg'
      },
      publishedDate: '2003',
      categories: ['Action', 'Thriller']
    }
  }
];

// Livros de Romance
export const romanceBooks: MockBookItem[] = [
  {
    id: 'romance1',
    volumeInfo: {
      title: 'Orgulho e Preconceito',
      authors: ['Jane Austen'],
      description: 'A história de Elizabeth Bennet e seu complicado relacionamento com o orgulhoso Sr. Darcy.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/6749574-L.jpg'
      },
      publishedDate: '1813',
      categories: ['Romance', 'Classic']
    }
  },
  {
    id: 'romance2',
    volumeInfo: {
      title: 'A Culpa é das Estrelas',
      authors: ['John Green'],
      description: 'Hazel Grace Lancaster, uma paciente de câncer de 16 anos, conhece e se apaixona por Augustus Waters, um ex-jogador de basquete amputado.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/7890059-L.jpg'
      },
      publishedDate: '2012',
      categories: ['Romance', 'Young Adult']
    }
  },
  {
    id: 'romance3',
    volumeInfo: {
      title: 'Romeu e Julieta',
      authors: ['William Shakespeare'],
      description: 'A história de dois jovens amantes cuja morte trágica reconcilia suas famílias em conflito.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/12645114-L.jpg'
      },
      publishedDate: '1597',
      categories: ['Romance', 'Classic', 'Tragedy']
    }
  }
];

// Livros de Aventura
export const adventureBooks: MockBookItem[] = [
  {
    id: 'adventure1',
    volumeInfo: {
      title: 'A Ilha do Tesouro',
      authors: ['Robert Louis Stevenson'],
      description: 'A história clássica de piratas, tesouros e aventura no mar, contada através dos olhos do jovem Jim Hawkins.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/12840696-L.jpg'
      },
      publishedDate: '1883',
      categories: ['Adventure', 'Classic']
    }
  },
  {
    id: 'adventure2',
    volumeInfo: {
      title: 'As Aventuras de Tom Sawyer',
      authors: ['Mark Twain'],
      description: 'As aventuras de um menino crescendo ao longo do rio Mississippi no século XIX.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/10504977-L.jpg'
      },
      publishedDate: '1876',
      categories: ['Adventure', 'Classic']
    }
  },
  {
    id: 'adventure3',
    volumeInfo: {
      title: 'Jurassic Park',
      authors: ['Michael Crichton'],
      description: 'Um parque temático de dinossauros criados geneticamente se torna um pesadelo quando os sistemas de segurança falham.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8091016-L.jpg'
      },
      publishedDate: '1990',
      categories: ['Adventure', 'Science Fiction']
    }
  }
];

// Livros de Ficção
export const fictionBooks: MockBookItem[] = [
  {
    id: 'fiction1',
    volumeInfo: {
      title: '1984',
      authors: ['George Orwell'],
      description: 'Um retrato assustador de uma sociedade totalitária do futuro, onde o governo controla todos os aspectos da vida dos cidadãos.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8575111-L.jpg'
      },
      publishedDate: '1949',
      categories: ['Fiction', 'Dystopian']
    }
  },
  {
    id: 'fiction2',
    volumeInfo: {
      title: 'Cem Anos de Solidão',
      authors: ['Gabriel García Márquez'],
      description: 'A história de sete gerações da família Buendía e a fundação da cidade fictícia de Macondo.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8701238-L.jpg'
      },
      publishedDate: '1967',
      categories: ['Fiction', 'Magical Realism']
    }
  },
  {
    id: 'fiction3',
    volumeInfo: {
      title: 'O Grande Gatsby',
      authors: ['F. Scott Fitzgerald'],
      description: 'A história de Jay Gatsby, um homem misteriosamente rico, e seu amor por Daisy Buchanan.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/6498481-L.jpg'
      },
      publishedDate: '1925',
      categories: ['Fiction', 'Classic']
    }
  }
];

// Livros de Mistério
export const mysteryBooks: MockBookItem[] = [
  {
    id: 'mystery1',
    volumeInfo: {
      title: 'O Assassinato no Expresso do Oriente',
      authors: ['Agatha Christie'],
      description: 'O famoso detetive Hercule Poirot investiga o assassinato de um passageiro no luxuoso trem Expresso do Oriente.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8231990-L.jpg'
      },
      publishedDate: '1934',
      categories: ['Mystery', 'Crime']
    }
  },
  {
    id: 'mystery2',
    volumeInfo: {
      title: 'O Cão dos Baskervilles',
      authors: ['Arthur Conan Doyle'],
      description: 'Sherlock Holmes e Dr. Watson investigam a morte de Sir Charles Baskerville e a lenda de um cão demoníaco.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8751565-L.jpg'
      },
      publishedDate: '1902',
      categories: ['Mystery', 'Classic']
    }
  },
  {
    id: 'mystery3',
    volumeInfo: {
      title: 'Garota Exemplar',
      authors: ['Gillian Flynn'],
      description: 'No dia de seu quinto aniversário de casamento, Amy Dunne desaparece. Seu marido, Nick, se torna o principal suspeito.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/7895635-L.jpg'
      },
      publishedDate: '2012',
      categories: ['Mystery', 'Thriller']
    }
  }
];

// Livros de Terror
export const horrorBooks: MockBookItem[] = [
  {
    id: 'horror1',
    volumeInfo: {
      title: 'O Iluminado',
      authors: ['Stephen King'],
      description: 'Jack Torrance se torna o zelador de inverno do isolado Hotel Overlook, onde forças sobrenaturais começam a afetar sua sanidade.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8643691-L.jpg'
      },
      publishedDate: '1977',
      categories: ['Horror', 'Supernatural']
    }
  },
  {
    id: 'horror2',
    volumeInfo: {
      title: 'Drácula',
      authors: ['Bram Stoker'],
      description: 'A história do vampiro Conde Drácula tentando mudar-se da Transilvânia para a Inglaterra.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/12880815-L.jpg'
      },
      publishedDate: '1897',
      categories: ['Horror', 'Gothic']
    }
  },
  {
    id: 'horror3',
    volumeInfo: {
      title: 'It: A Coisa',
      authors: ['Stephen King'],
      description: 'Um grupo de crianças enfrenta uma entidade maligna que se disfarça como um palhaço e explora os medos de suas vítimas.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8114155-L.jpg'
      },
      publishedDate: '1986',
      categories: ['Horror', 'Supernatural']
    }
  }
];

// Livros de Biografia
export const biographyBooks: MockBookItem[] = [
  {
    id: 'biography1',
    volumeInfo: {
      title: 'Steve Jobs',
      authors: ['Walter Isaacson'],
      description: 'A biografia do inovador cofundador da Apple, baseada em mais de quarenta entrevistas com Jobs.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/7327476-L.jpg'
      },
      publishedDate: '2011',
      categories: ['Biography', 'Business']
    }
  },
  {
    id: 'biography2',
    volumeInfo: {
      title: 'Eu Sou Malala',
      authors: ['Malala Yousafzai'],
      description: 'A história da garota que defendeu o direito à educação e foi baleada pelo Talibã.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/7680175-L.jpg'
      },
      publishedDate: '2013',
      categories: ['Biography', 'Memoir']
    }
  },
  {
    id: 'biography3',
    volumeInfo: {
      title: 'Becoming: Minha História',
      authors: ['Michelle Obama'],
      description: 'As memórias da ex-primeira-dama dos Estados Unidos, Michelle Obama.',
      imageLinks: {
        thumbnail: 'https://covers.openlibrary.org/b/id/8578022-L.jpg'
      },
      publishedDate: '2018',
      categories: ['Biography', 'Memoir']
    }
  }
];

// Mapa de categorias para livros mockados
export const mockBooksByCategory: Record<string, MockBookItem[]> = {
  fantasy: fantasyBooks,
  action: actionBooks,
  romance: romanceBooks,
  adventure: adventureBooks,
  fiction: fictionBooks,
  mystery: mysteryBooks,
  horror: horrorBooks,
  biography: biographyBooks
};
