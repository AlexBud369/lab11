const inputField = document.querySelector('.search-field');
const searchForm = document.getElementById('search-form-id');
const booksContainer = document.querySelector('.books-container');
const clearButton = document.querySelector('.clear-btn');
const filtersSelect = document.getElementById('books-filters');
const noResults = document.querySelector('.no-results');
const apiKey = 'AIzaSyB8sN3w-sYj79mlncmsgUjPxq1zfFrjPDo';

const maxBooksCount = 10;

function enterEvent() {
    searchForm.addEventListener('submit',  searchBooks)
}

function searchBooks(event) {
        event.preventDefault();
        if (inputField.value.trim() === '') {
            return;
        }
        const query = encodeURIComponent(inputField.value.trim());
        getData(`https://www.googleapis.com/books/v1/volumes?q=intitle:${query}&maxResults=${maxBooksCount}&key=${apiKey}`);
}

function clearInputField() {
    inputField.value = '';
    noResults.style.display = 'none';
    getData(`https://www.googleapis.com/books/v1/volumes?q=bestsellers&maxResults=${maxBooksCount}&key=${apiKey}`)
    inputField.focus();
}

function clearButtonEvent(){
    clearButton.addEventListener('click', clearInputField);
}

function getChosenFilter() {
    const filterValue = filtersSelect.value;
    let query = inputField.value.trim() || 'bestsellers';
    query = encodeURIComponent(query);
    let  qValue;
    let url = '';
     switch (filterValue) {
        case 'title-harry':
            qValue = `intitle:Harry+Potter`;
            break;
        case 'author-king':
            qValue = `inauthor:Stephen+King`;
            break;
        case 'publisher-maklu':
            qValue = `inpublisher:Maklu`;
            break;
        case 'free-ebooks':
            qValue = query === 'bestsellers' ? 'bestsellers' : query;
            url = `https://www.googleapis.com/books/v1/volumes?q=${qValue}&filter=free-ebooks&maxResults=${maxBooksCount}&key=${apiKey}`;
            break;
        case 'paid-ebooks':
            qValue = query === 'bestsellers' ? 'bestsellers' : query;
            url = `https://www.googleapis.com/books/v1/volumes?q=${qValue}&filter=paid-ebooks&maxResults=${maxBooksCount}&key=${apiKey}`;
            break;
        default:
            qValue = query;
    }

    if (!url) {
        url = `https://www.googleapis.com/books/v1/volumes?q=${qValue}${query}&maxResults=${maxBooksCount}&key=${apiKey}`;
    }

    getData(url);
}


function filtersEvent(){
    filtersSelect.addEventListener('change', getChosenFilter)
}


function loadsBooks(){
    getData(`https://www.googleapis.com/books/v1/volumes?q=bestsellers&maxResults=${maxBooksCount}&key=${apiKey}`)
    enterEvent();
    clearButtonEvent();
    filtersEvent();
}

async function getData(url){
     try{
        const response = await fetch(url);
        if (!response.ok){
            throw new Error(`Error HTTP ${response.status}`);
        } 
        const data = await response.json();
        const resultsIsTrue = checkResults(data);

        if (resultsIsTrue === false) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
            renderBooks(data.items);
        }  
        
    } catch (error) {
        console.error(error);
    }
}

function checkResults(data){
    if (data.items?.length === 0 || !data.items) {
        return false;
    }
    return true;
}

function renderBooks(data) {
    booksContainer.innerHTML = '';
    data.forEach(book => {
        const bookCard = document.createElement('article');
        bookCard.className = 'book-item';
        const thumbnail = book.volumeInfo.imageLinks?.thumbnail || 'images/no-cover.jpg';
        const title = book.volumeInfo.title || '';
        const authors = book.volumeInfo.authors?.join(', ') || '';
        const category = book.volumeInfo.categories?.[0] || '';
        const publisher = book.volumeInfo.publisher || '';

        bookCard.innerHTML = `
            <img class="book-cover" src="${thumbnail}" alt="${title}>
            <div class="book-info">
                <span class="category-label">Title: </span><p>${title}</p>
                <span class="category-label">Author: </span><p>${authors}</p>>
                <span class="category-label">Category: </span><p>${category}</p>
                <span class="category-label">Publisher:</span><p>${publisher}</p>
            </div>
        `;
        booksContainer.appendChild(bookCard);
    });
}

window.addEventListener('load', loadsBooks);