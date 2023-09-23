import { useEffect, useState } from 'react';
import axios from 'axios';

// Get Distinct Words from Database
function useFetchWords(url) {
    const [words, setWords] = useState([]);

    useEffect(() => {
        axios.get(url)
            .then(response => {
                const distinctWords = Array.from(
                    new Set(response.data.map(word => word.word))
                ).map(word => {
                    return response.data.find(item => item.word === word);
                });
                setWords(distinctWords);
            })
            .catch(error => console.error('There was an error fetching the words:', error));
    }, [url]);

    return words;
}

export default useFetchWords;
