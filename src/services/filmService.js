import { getData, updateData } from '../utils/storageService';
import { mockFilms } from '../mock/mockFilms';

if (!getData('films')) {
    updateData('films', () => mockFilms);
}

const simulateNetwork = (data) => {
    return new Promise(resolve => setTimeout(() => resolve({ success: true, data }), 500));
};

export const filmService = {
    getAllFilms: () => {
        return simulateNetwork(getData('films'));
    },
    getFilmById: (id) => {
        const films = getData('films');
        return simulateNetwork(films.find(f => f.id === id) || null);
    },
    likeFilm: (id) => {
        return simulateNetwork(true);
    }
};
