import { AudioProduct, AudioFormat, AudioGenre, AgeRestriction } from '../../../src/domain/entities/audio-product.entity';

describe('AudioProduct Entity', () => {
  const mockDate = new Date('2024-01-01T00:00:00Z');
  const mockReleaseDate = new Date('1975-10-31');

  describe('Constructor', () => {
    it('should create an audio product with all required properties', () => {
      const audioProduct = new AudioProduct(
        'audio-123',
        'Bohemian Rhapsody',
        'Una de las canciones más icónicas de Queen',
        'Queen',
        AudioGenre.ROCK,
        'https://example.com/audio/bohemian-rhapsody.mp3',
        354,
        AudioFormat.MP3,
        320,
        9.99,
        100,
        true,
        ['rock', '70s', 'classic'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(audioProduct.id).toBe('audio-123');
      expect(audioProduct.title).toBe('Bohemian Rhapsody');
      expect(audioProduct.description).toBe('Una de las canciones más icónicas de Queen');
      expect(audioProduct.artist).toBe('Queen');
      expect(audioProduct.genre).toBe(AudioGenre.ROCK);
      expect(audioProduct.audioUrl).toBe('https://example.com/audio/bohemian-rhapsody.mp3');
      expect(audioProduct.duration).toBe(354);
      expect(audioProduct.format).toBe(AudioFormat.MP3);
      expect(audioProduct.bitrate).toBe(320);
      expect(audioProduct.price).toBe(9.99);
      expect(audioProduct.stock).toBe(100);
      expect(audioProduct.isActive).toBe(true);
      expect(audioProduct.tags).toEqual(['rock', '70s', 'classic']);
      expect(audioProduct.releaseDate).toEqual(mockReleaseDate);
      expect(audioProduct.language).toBe('en');
      expect(audioProduct.isExplicit).toBe(false);
      expect(audioProduct.ageRestriction).toBe(AgeRestriction.ALL_AGES);
      expect(audioProduct.playCount).toBe(0);
      expect(audioProduct.downloadCount).toBe(0);
      expect(audioProduct.createdAt).toEqual(mockDate);
      expect(audioProduct.updatedAt).toEqual(mockDate);
    });

    it('should create an audio product with different genres', () => {
      const jazzProduct = new AudioProduct(
        'jazz-123',
        'Take Five',
        'Classic jazz piece',
        'Dave Brubeck',
        AudioGenre.JAZZ,
        'https://example.com/audio/take-five.mp3',
        324,
        AudioFormat.WAV,
        1411,
        12.99,
        50,
        true,
        ['jazz', 'instrumental'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(jazzProduct.genre).toBe(AudioGenre.JAZZ);
      expect(jazzProduct.format).toBe(AudioFormat.WAV);
      expect(jazzProduct.bitrate).toBe(1411);
    });

    it('should create an audio product with explicit content and age restriction', () => {
      const explicitProduct = new AudioProduct(
        'explicit-123',
        'Explicit Song',
        'Song with explicit content',
        'Explicit Artist',
        AudioGenre.HIP_HOP,
        'https://example.com/audio/explicit.mp3',
        180,
        AudioFormat.MP3,
        320,
        7.99,
        75,
        true,
        ['hip-hop', 'explicit'],
        mockReleaseDate,
        'en',
        true,
        AgeRestriction.ADULT,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(explicitProduct.isExplicit).toBe(true);
      expect(explicitProduct.ageRestriction).toBe(AgeRestriction.ADULT);
    });
  });

  describe('Static create method', () => {
    it('should create audio product data with default values', () => {
      const productData = AudioProduct.create(
        'New Song',
        'A new song description',
        'New Artist',
        AudioGenre.POP,
        'https://example.com/audio/new-song.mp3',
        240,
        AudioFormat.MP3,
        256,
        5.99,
        200,
        ['pop', 'new'],
        mockReleaseDate,
        'es'
      );

      expect(productData.title).toBe('New Song');
      expect(productData.description).toBe('A new song description');
      expect(productData.artist).toBe('New Artist');
      expect(productData.genre).toBe(AudioGenre.POP);
      expect(productData.audioUrl).toBe('https://example.com/audio/new-song.mp3');
      expect(productData.duration).toBe(240);
      expect(productData.format).toBe(AudioFormat.MP3);
      expect(productData.bitrate).toBe(256);
      expect(productData.price).toBe(5.99);
      expect(productData.stock).toBe(200);
      expect(productData.tags).toEqual(['pop', 'new']);
      expect(productData.releaseDate).toEqual(mockReleaseDate);
      expect(productData.language).toBe('es');
      expect(productData.isActive).toBe(true);
      expect(productData.isExplicit).toBe(false);
      expect(productData.ageRestriction).toBe(AgeRestriction.ALL_AGES);
      expect(productData.playCount).toBe(0);
      expect(productData.downloadCount).toBe(0);
    });

    it('should create audio product data with custom explicit and age restriction', () => {
      const productData = AudioProduct.create(
        'Mature Song',
        'A mature song description',
        'Mature Artist',
        AudioGenre.ROCK,
        'https://example.com/audio/mature-song.mp3',
        300,
        AudioFormat.FLAC,
        1411,
        15.99,
        100,
        ['rock', 'mature'],
        mockReleaseDate,
        'en',
        true,
        AgeRestriction.MATURE
      );

      expect(productData.isExplicit).toBe(true);
      expect(productData.ageRestriction).toBe(AgeRestriction.MATURE);
    });
  });

  describe('Getters', () => {
    let audioProduct: AudioProduct;

    beforeEach(() => {
      audioProduct = new AudioProduct(
        'audio-123',
        'Bohemian Rhapsody',
        'Una de las canciones más icónicas de Queen',
        'Queen',
        AudioGenre.ROCK,
        'https://example.com/audio/bohemian-rhapsody.mp3',
        354,
        AudioFormat.MP3,
        320,
        9.99,
        100,
        true,
        ['rock', '70s', 'classic'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );
    });

    describe('durationFormatted getter', () => {
      it('should return formatted duration for minutes and seconds', () => {
        expect(audioProduct.durationFormatted).toBe('5:54');
      });

      it('should handle duration with only seconds', () => {
        const shortProduct = new AudioProduct(
          'short-123',
          'Short Song',
          'A very short song',
          'Short Artist',
          AudioGenre.POP,
          'https://example.com/audio/short.mp3',
          45,
          AudioFormat.MP3,
          128,
          1.99,
          50,
          true,
          ['pop', 'short'],
          mockReleaseDate,
          'en',
          false,
          AgeRestriction.ALL_AGES,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(shortProduct.durationFormatted).toBe('0:45');
      });

      it('should handle duration with exact minutes', () => {
        const exactProduct = new AudioProduct(
          'exact-123',
          'Exact Song',
          'A song with exact minutes',
          'Exact Artist',
          AudioGenre.POP,
          'https://example.com/audio/exact.mp3',
          180,
          AudioFormat.MP3,
          128,
          2.99,
          50,
          true,
          ['pop', 'exact'],
          mockReleaseDate,
          'en',
          false,
          AgeRestriction.ALL_AGES,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(exactProduct.durationFormatted).toBe('3:00');
      });
    });

    describe('priceFormatted getter', () => {
      it('should return formatted price with dollar sign and two decimals', () => {
        expect(audioProduct.priceFormatted).toBe('$9.99');
      });

      it('should handle price with one decimal', () => {
        const priceProduct = new AudioProduct(
          'price-123',
          'Price Song',
          'A song with specific price',
          'Price Artist',
          AudioGenre.POP,
          'https://example.com/audio/price.mp3',
          180,
          AudioFormat.MP3,
          128,
          5.5,
          50,
          true,
          ['pop', 'price'],
          mockReleaseDate,
          'en',
          false,
          AgeRestriction.ALL_AGES,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(priceProduct.priceFormatted).toBe('$5.50');
      });

      it('should handle price with zero', () => {
        const freeProduct = new AudioProduct(
          'free-123',
          'Free Song',
          'A free song',
          'Free Artist',
          AudioGenre.POP,
          'https://example.com/audio/free.mp3',
          180,
          AudioFormat.MP3,
          128,
          0,
          50,
          true,
          ['pop', 'free'],
          mockReleaseDate,
          'en',
          false,
          AgeRestriction.ALL_AGES,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(freeProduct.priceFormatted).toBe('$0.00');
      });
    });
  });

  describe('Stock methods', () => {
    let audioProduct: AudioProduct;

    beforeEach(() => {
      audioProduct = new AudioProduct(
        'audio-123',
        'Bohemian Rhapsody',
        'Una de las canciones más icónicas de Queen',
        'Queen',
        AudioGenre.ROCK,
        'https://example.com/audio/bohemian-rhapsody.mp3',
        354,
        AudioFormat.MP3,
        320,
        9.99,
        100,
        true,
        ['rock', '70s', 'classic'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );
    });

    describe('isInStock method', () => {
      it('should return true when stock is greater than 0', () => {
        expect(audioProduct.isInStock()).toBe(true);
      });

      it('should return false when stock is 0', () => {
        const outOfStockProduct = new AudioProduct(
          'out-123',
          'Out of Stock Song',
          'A song without stock',
          'Out Artist',
          AudioGenre.POP,
          'https://example.com/audio/out.mp3',
          180,
          AudioFormat.MP3,
          128,
          5.99,
          0,
          true,
          ['pop', 'out'],
          mockReleaseDate,
          'en',
          false,
          AgeRestriction.ALL_AGES,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(outOfStockProduct.isInStock()).toBe(false);
      });
    });

    describe('canPurchase method', () => {
      it('should return true when product is active and has sufficient stock', () => {
        expect(audioProduct.canPurchase(50)).toBe(true);
        expect(audioProduct.canPurchase(100)).toBe(true);
      });

      it('should return false when product is inactive', () => {
        const inactiveProduct = new AudioProduct(
          'inactive-123',
          'Inactive Song',
          'An inactive song',
          'Inactive Artist',
          AudioGenre.POP,
          'https://example.com/audio/inactive.mp3',
          180,
          AudioFormat.MP3,
          128,
          5.99,
          100,
          false,
          ['pop', 'inactive'],
          mockReleaseDate,
          'en',
          false,
          AgeRestriction.ALL_AGES,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(inactiveProduct.canPurchase(50)).toBe(false);
      });

      it('should return false when stock is insufficient', () => {
        expect(audioProduct.canPurchase(101)).toBe(false);
        expect(audioProduct.canPurchase(150)).toBe(false);
      });

      it('should return false when product is inactive and stock is insufficient', () => {
        const inactiveProduct = new AudioProduct(
          'inactive-123',
          'Inactive Song',
          'An inactive song',
          'Inactive Artist',
          AudioGenre.POP,
          'https://example.com/audio/inactive.mp3',
          180,
          AudioFormat.MP3,
          128,
          5.99,
          100,
          false,
          ['pop', 'inactive'],
          mockReleaseDate,
          'en',
          false,
          AgeRestriction.ALL_AGES,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(inactiveProduct.canPurchase(50)).toBe(false);
      });
    });

    describe('decreaseStock method', () => {
      it('should decrease stock successfully', () => {
        const updatedProduct = audioProduct.decreaseStock(25);
        expect(updatedProduct.stock).toBe(75);
      });

      it('should throw error when stock is insufficient', () => {
        expect(() => audioProduct.decreaseStock(101)).toThrow('Stock insuficiente');
        expect(() => audioProduct.decreaseStock(150)).toThrow('Stock insuficiente');
      });

      it('should return a new AudioProduct instance', () => {
        const updatedProduct = audioProduct.decreaseStock(25);
        expect(updatedProduct).not.toBe(audioProduct);
        expect(updatedProduct.stock).toBe(75);
        expect(audioProduct.stock).toBe(100); // Original unchanged
      });

      it('should update updatedAt timestamp', () => {
        const updatedProduct = audioProduct.decreaseStock(25);
        expect(updatedProduct.updatedAt.getTime()).toBeGreaterThan(audioProduct.updatedAt.getTime());
      });
    });

    describe('increaseStock method', () => {
      it('should increase stock successfully', () => {
        const updatedProduct = audioProduct.increaseStock(50);
        expect(updatedProduct.stock).toBe(150);
      });

      it('should return a new AudioProduct instance', () => {
        const updatedProduct = audioProduct.increaseStock(50);
        expect(updatedProduct).not.toBe(audioProduct);
        expect(updatedProduct.stock).toBe(150);
        expect(audioProduct.stock).toBe(100); // Original unchanged
      });

      it('should update updatedAt timestamp', () => {
        const updatedProduct = audioProduct.increaseStock(50);
        expect(updatedProduct.updatedAt.getTime()).toBeGreaterThan(audioProduct.updatedAt.getTime());
      });
    });
  });

  describe('Access control methods', () => {
    describe('canAccess method', () => {
      it('should allow access for users of appropriate age', () => {
        const allAgesProduct = new AudioProduct(
          'all-ages-123',
          'All Ages Song',
          'A song for all ages',
          'All Ages Artist',
          AudioGenre.POP,
          'https://example.com/audio/all-ages.mp3',
          180,
          AudioFormat.MP3,
          128,
          5.99,
          100,
          true,
          ['pop', 'all-ages'],
          mockReleaseDate,
          'en',
          false,
          AgeRestriction.ALL_AGES,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(allAgesProduct.canAccess(5)).toBe(true);
        expect(allAgesProduct.canAccess(18)).toBe(true);
        expect(allAgesProduct.canAccess(65)).toBe(true);
      });

      it('should restrict access for teen content', () => {
        const teenProduct = new AudioProduct(
          'teen-123',
          'Teen Song',
          'A song for teens and up',
          'Teen Artist',
          AudioGenre.POP,
          'https://example.com/audio/teen.mp3',
          180,
          AudioFormat.MP3,
          128,
          5.99,
          100,
          true,
          ['pop', 'teen'],
          mockReleaseDate,
          'en',
          false,
          AgeRestriction.TEEN,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(teenProduct.canAccess(12)).toBe(false);
        expect(teenProduct.canAccess(13)).toBe(true);
        expect(teenProduct.canAccess(18)).toBe(true);
      });

      it('should restrict access for adult content', () => {
        const adultProduct = new AudioProduct(
          'adult-123',
          'Adult Song',
          'A song for adults',
          'Adult Artist',
          AudioGenre.ROCK,
          'https://example.com/audio/adult.mp3',
          180,
          AudioFormat.MP3,
          128,
          5.99,
          100,
          true,
          ['rock', 'adult'],
          mockReleaseDate,
          'en',
          true,
          AgeRestriction.ADULT,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(adultProduct.canAccess(17)).toBe(false);
        expect(adultProduct.canAccess(18)).toBe(true);
        expect(adultProduct.canAccess(25)).toBe(true);
      });

      it('should restrict access for mature content', () => {
        const matureProduct = new AudioProduct(
          'mature-123',
          'Mature Song',
          'A song for mature audiences',
          'Mature Artist',
          AudioGenre.ROCK,
          'https://example.com/audio/mature.mp3',
          180,
          AudioFormat.MP3,
          128,
          5.99,
          100,
          true,
          ['rock', 'mature'],
          mockReleaseDate,
          'en',
          true,
          AgeRestriction.MATURE,
          0,
          0,
          mockDate,
          mockDate
        );

        expect(matureProduct.canAccess(20)).toBe(false);
        expect(matureProduct.canAccess(21)).toBe(true);
        expect(matureProduct.canAccess(30)).toBe(true);
      });
    });
  });

  describe('Analytics methods', () => {
    let audioProduct: AudioProduct;

    beforeEach(() => {
      audioProduct = new AudioProduct(
        'audio-123',
        'Bohemian Rhapsody',
        'Una de las canciones más icónicas de Queen',
        'Queen',
        AudioGenre.ROCK,
        'https://example.com/audio/bohemian-rhapsody.mp3',
        354,
        AudioFormat.MP3,
        320,
        9.99,
        100,
        true,
        ['rock', '70s', 'classic'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        100,
        50,
        mockDate,
        mockDate
      );
    });

    describe('incrementPlayCount method', () => {
      it('should increment play count by 1', () => {
        const updatedProduct = audioProduct.incrementPlayCount();
        expect(updatedProduct.playCount).toBe(101);
      });

      it('should return a new AudioProduct instance', () => {
        const updatedProduct = audioProduct.incrementPlayCount();
        expect(updatedProduct).not.toBe(audioProduct);
        expect(updatedProduct.playCount).toBe(101);
        expect(audioProduct.playCount).toBe(100); // Original unchanged
      });

      it('should update updatedAt timestamp', () => {
        const updatedProduct = audioProduct.incrementPlayCount();
        expect(updatedProduct.updatedAt.getTime()).toBeGreaterThan(audioProduct.updatedAt.getTime());
      });
    });

    describe('incrementDownloadCount method', () => {
      it('should increment download count by 1', () => {
        const updatedProduct = audioProduct.incrementDownloadCount();
        expect(updatedProduct.downloadCount).toBe(51);
      });

      it('should return a new AudioProduct instance', () => {
        const updatedProduct = audioProduct.incrementDownloadCount();
        expect(updatedProduct).not.toBe(audioProduct);
        expect(updatedProduct.downloadCount).toBe(51);
        expect(audioProduct.downloadCount).toBe(50); // Original unchanged
      });

      it('should update updatedAt timestamp', () => {
        const updatedProduct = audioProduct.incrementDownloadCount();
        expect(updatedProduct.updatedAt.getTime()).toBeGreaterThan(audioProduct.updatedAt.getTime());
      });
    });
  });

  describe('Immutability', () => {
    let audioProduct: AudioProduct;

    beforeEach(() => {
      audioProduct = new AudioProduct(
        'audio-123',
        'Bohemian Rhapsody',
        'Una de las canciones más icónicas de Queen',
        'Queen',
        AudioGenre.ROCK,
        'https://example.com/audio/bohemian-rhapsody.mp3',
        354,
        AudioFormat.MP3,
        320,
        9.99,
        100,
        true,
        ['rock', '70s', 'classic'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );
    });

    it('should not modify original product when decreasing stock', () => {
      const originalStock = audioProduct.stock;
      const originalUpdatedAt = audioProduct.updatedAt;
      
      audioProduct.decreaseStock(25);
      
      expect(audioProduct.stock).toBe(originalStock);
      expect(audioProduct.updatedAt).toEqual(originalUpdatedAt);
    });

    it('should not modify original product when increasing stock', () => {
      const originalStock = audioProduct.stock;
      const originalUpdatedAt = audioProduct.updatedAt;
      
      audioProduct.increaseStock(50);
      
      expect(audioProduct.stock).toBe(originalStock);
      expect(audioProduct.updatedAt).toEqual(originalUpdatedAt);
    });

    it('should not modify original product when incrementing play count', () => {
      const originalPlayCount = audioProduct.playCount;
      const originalUpdatedAt = audioProduct.updatedAt;
      
      audioProduct.incrementPlayCount();
      
      expect(audioProduct.playCount).toBe(originalPlayCount);
      expect(audioProduct.updatedAt).toEqual(originalUpdatedAt);
    });

    it('should not modify original product when incrementing download count', () => {
      const originalDownloadCount = audioProduct.downloadCount;
      const originalUpdatedAt = audioProduct.updatedAt;
      
      audioProduct.incrementDownloadCount();
      
      expect(audioProduct.downloadCount).toBe(originalDownloadCount);
      expect(audioProduct.updatedAt).toEqual(originalUpdatedAt);
    });
  });

  describe('Edge cases', () => {
    it('should handle very long titles and descriptions', () => {
      const longTitle = 'A'.repeat(255);
      const longDescription = 'B'.repeat(1000);
      
      const audioProduct = new AudioProduct(
        'long-123',
        longTitle,
        longDescription,
        'Long Artist',
        AudioGenre.POP,
        'https://example.com/audio/long.mp3',
        180,
        AudioFormat.MP3,
        128,
        5.99,
        100,
        true,
        ['pop', 'long'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(audioProduct.title).toBe(longTitle);
      expect(audioProduct.description).toBe(longDescription);
    });

    it('should handle special characters in text fields', () => {
      const specialTitle = 'Song with special chars: áéíóú ñ & % $ # @ !';
      const specialArtist = 'Artist with symbols: © ® ™ ♪ ♫';
      
      const audioProduct = new AudioProduct(
        'special-123',
        specialTitle,
        'Description with special chars',
        specialArtist,
        AudioGenre.POP,
        'https://example.com/audio/special.mp3',
        180,
        AudioFormat.MP3,
        128,
        5.99,
        100,
        true,
        ['pop', 'special'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(audioProduct.title).toBe(specialTitle);
      expect(audioProduct.artist).toBe(specialArtist);
    });

    it('should handle extreme duration values', () => {
      const veryShortProduct = new AudioProduct(
        'short-123',
        'Very Short Song',
        'A very short song',
        'Short Artist',
        AudioGenre.POP,
        'https://example.com/audio/short.mp3',
        1,
        AudioFormat.MP3,
        128,
        0.99,
        100,
        true,
        ['pop', 'short'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );

      const veryLongProduct = new AudioProduct(
        'long-123',
        'Very Long Song',
        'A very long song',
        'Long Artist',
        AudioGenre.CLASSICAL,
        'https://example.com/audio/long.mp3',
        7200, // 2 hours
        AudioFormat.FLAC,
        1411,
        29.99,
        100,
        true,
        ['classical', 'long'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(veryShortProduct.durationFormatted).toBe('0:01');
      expect(veryLongProduct.durationFormatted).toBe('120:00');
    });

    it('should handle extreme price values', () => {
      const freeProduct = new AudioProduct(
        'free-123',
        'Free Song',
        'A free song',
        'Free Artist',
        AudioGenre.POP,
        'https://example.com/audio/free.mp3',
        180,
        AudioFormat.MP3,
        128,
        0,
        100,
        true,
        ['pop', 'free'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );

      const expensiveProduct = new AudioProduct(
        'expensive-123',
        'Expensive Song',
        'A very expensive song',
        'Expensive Artist',
        AudioGenre.CLASSICAL,
        'https://example.com/audio/expensive.flac',
        1800,
        AudioFormat.FLAC,
        1411,
        999.99,
        1,
        true,
        ['classical', 'expensive'],
        mockReleaseDate,
        'en',
        false,
        AgeRestriction.ALL_AGES,
        0,
        0,
        mockDate,
        mockDate
      );

      expect(freeProduct.priceFormatted).toBe('$0.00');
      expect(expensiveProduct.priceFormatted).toBe('$999.99');
    });
  });
});
