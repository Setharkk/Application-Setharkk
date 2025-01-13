/* eslint-disable */
interface Column {
    key: string;
    sortable: boolean;
    type: 'string' | 'number';
    defaultDescSort?: boolean;
}

interface CurrentSort {
    index: number;
    desc: boolean;
}

interface RowData {
    [key: string]: string | number;
}

interface HTMLTableRowWithData extends HTMLTableRowElement {
    data?: RowData;
}

const addSorting = (function() {
    'use strict';
    
    let cols: Column[];
    const currentSort: CurrentSort = {
        index: 0,
        desc: false
    };

    // Retourne l'élément de tableau de résumé
    function getTable(): HTMLTableElement | null {
        return document.querySelector('.coverage-summary');
    }

    // Retourne l'élément thead du tableau de résumé
    function getTableHeader(): HTMLTableRowElement | null {
        return getTable()?.querySelector('thead tr') || null;
    }

    // Retourne l'élément tbody du tableau de résumé
    function getTableBody(): HTMLTableSectionElement | null {
        return getTable()?.querySelector('tbody') || null;
    }

    // Retourne l'élément th pour la nième colonne
    function getNthColumn(n: number): HTMLTableCellElement | null {
        const header = getTableHeader();
        return header ? header.querySelectorAll('th')[n] as HTMLTableCellElement : null;
    }

    function onFilterInput(): void {
        const searchBox = document.getElementById('fileSearch') as HTMLInputElement;
        const searchValue = searchBox?.value || '';
        const tbody = document.getElementsByTagName('tbody')[0];
        const rows = tbody?.children || [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i] as HTMLTableRowElement;
            if (row.textContent?.toLowerCase().includes(searchValue.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    }

    // Charge la boîte de recherche
    function addSearchBox(): void {
        const template = document.getElementById('filterTemplate') as HTMLTemplateElement;
        if (template && template.content) {
            const templateClone = template.content.cloneNode(true) as DocumentFragment;
            const searchBox = templateClone.getElementById('fileSearch');
            if (searchBox) {
                searchBox.oninput = onFilterInput;
            }
            template.parentElement?.appendChild(templateClone);
        }
    }

    // Charge toutes les colonnes
    function loadColumns(): Column[] {
        const header = getTableHeader();
        if (!header) return [];

        const colNodes = header.querySelectorAll('th');
        const cols: Column[] = [];

        for (let i = 0; i < colNodes.length; i++) {
            const colNode = colNodes[i];
            const col: Column = {
                key: colNode.getAttribute('data-col') || '',
                sortable: !colNode.getAttribute('data-nosort'),
                type: (colNode.getAttribute('data-type') || 'string') as 'string' | 'number'
            };

            cols.push(col);
            if (col.sortable) {
                col.defaultDescSort = col.type === 'number';
                colNode.innerHTML = colNode.innerHTML + '<span class="sorter"></span>';
            }
        }
        return cols;
    }

    // Attache un attribut de données à chaque élément tr avec un objet
    // de valeurs de données indexées par nom de colonne
    function loadRowData(tableRow: HTMLTableRowElement): RowData {
        const tableCols = tableRow.querySelectorAll('td');
        const data: RowData = {};

        for (let i = 0; i < tableCols.length; i++) {
            const colNode = tableCols[i];
            const col = cols[i];
            let val = colNode.getAttribute('data-value');

            if (col.type === 'number' && val !== null) {
                val = Number(val);
            }

            data[col.key] = val || '';
        }
        return data;
    }

    // Charge toutes les données des lignes
    function loadData(): void {
        const tbody = getTableBody();
        if (!tbody) return;

        const rows = tbody.querySelectorAll('tr');
        for (let i = 0; i < rows.length; i++) {
            (rows[i] as HTMLTableRowWithData).data = loadRowData(rows[i]);
        }
    }

    // Trie le tableau en utilisant les données de la ième colonne
    function sortByIndex(index: number, desc: boolean): void {
        const key = cols[index].key;
        const sorter = (a: HTMLTableRowWithData, b: HTMLTableRowWithData): number => {
            const aVal = a.data?.[key];
            const bVal = b.data?.[key];
            if (aVal === undefined || bVal === undefined) return 0;
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        };

        const finalSorter = desc ? 
            (a: HTMLTableRowWithData, b: HTMLTableRowWithData) => -1 * sorter(a, b) : 
            sorter;

        const tableBody = document.querySelector('.coverage-summary tbody');
        if (!tableBody) return;

        const rowNodes = tableBody.querySelectorAll('tr');
        const rows: HTMLTableRowWithData[] = Array.from(rowNodes) as HTMLTableRowWithData[];

        rows.forEach(row => tableBody.removeChild(row));
        rows.sort(finalSorter);
        rows.forEach(row => tableBody.appendChild(row));
    }

    // Supprime les indicateurs de tri pour la colonne en cours de tri
    function removeSortIndicators(): void {
        const col = getNthColumn(currentSort.index);
        if (!col) return;

        let cls = col.className;
        cls = cls.replace(/ sorted$/, '').replace(/ sorted-desc$/, '');
        col.className = cls;
    }

    // Ajoute des indicateurs de tri pour la colonne en cours de tri
    function addSortIndicators(): void {
        const col = getNthColumn(currentSort.index);
        if (!col) return;

        col.className += currentSort.desc ? ' sorted-desc' : ' sorted';
    }

    // Ajoute des écouteurs d'événements pour tous les widgets de tri
    function enableUI(): void {
        const ithSorter = (i: number) => {
            const col = cols[i];

            return () => {
                let desc = col.defaultDescSort;

                if (currentSort.index === i) {
                    desc = !currentSort.desc;
                }
                
                sortByIndex(i, desc);
                removeSortIndicators();
                currentSort.index = i;
                currentSort.desc = desc;
                addSortIndicators();
            };
        };

        for (let i = 0; i < cols.length; i++) {
            if (cols[i].sortable) {
                const el = getNthColumn(i)?.querySelector('.sorter')?.parentElement;
                if (!el) continue;

                if (el.addEventListener) {
                    el.addEventListener('click', ithSorter(i));
                } else {
                    (el as any).attachEvent('onclick', ithSorter(i));
                }
            }
        }
    }

    // Ajoute la fonctionnalité de tri à l'interface utilisateur
    return function(): void {
        const table = getTable();
        if (!table) return;

        cols = loadColumns();
        loadData();
        addSearchBox();
        addSortIndicators();
        enableUI();
    };
})();

window.addEventListener('load', addSorting); 