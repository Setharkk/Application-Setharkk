 
const jumpToCode = (function init() {
    // Classes de code que nous voulons mettre en évidence dans la vue du fichier
    const missingCoverageClasses: string[] = ['.cbranch-no', '.cstat-no', '.fstat-no'];

    // Éléments à mettre en évidence dans la vue de la liste des fichiers
    const fileListingElements: string[] = ['td.pct.low'];

    // Nous ne voulons pas sélectionner les éléments qui sont des descendants directs d'une autre correspondance
    const notSelector: string = ':not(' + missingCoverageClasses.join('):not(') + ') > '; // devient `:not(a):not(b) > `

    // Sélecteur qui trouve les éléments de la page vers lesquels nous pouvons sauter
    const selector: string =
        fileListingElements.join(', ') +
        ', ' +
        notSelector +
        missingCoverageClasses.join(', ' + notSelector); // devient `:not(a):not(b) > a, :not(a):not(b) > b`

    // La NodeList des éléments correspondants
    const missingCoverageElements: NodeListOf<Element> = document.querySelectorAll(selector);

    let currentIndex: number | undefined;

    function toggleClass(index: number): void {
        if (typeof currentIndex === 'number') {
            missingCoverageElements
                .item(currentIndex)
                .classList.remove('highlighted');
        }
        missingCoverageElements.item(index).classList.add('highlighted');
    }

    function makeCurrent(index: number): void {
        toggleClass(index);
        currentIndex = index;
        missingCoverageElements.item(index).scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }

    function goToPrevious(): void {
        let nextIndex = 0;
        if (typeof currentIndex !== 'number' || currentIndex === 0) {
            nextIndex = missingCoverageElements.length - 1;
        } else if (missingCoverageElements.length > 1) {
            nextIndex = currentIndex - 1;
        }

        makeCurrent(nextIndex);
    }

    function goToNext(): void {
        let nextIndex = 0;

        if (
            typeof currentIndex === 'number' &&
            currentIndex < missingCoverageElements.length - 1
        ) {
            nextIndex = currentIndex + 1;
        }

        makeCurrent(nextIndex);
    }

    return function jump(event: KeyboardEvent): void {
        const activeElement = document.activeElement as HTMLElement | null;
        if (
            document.getElementById('fileSearch') === activeElement &&
            activeElement !== null
        ) {
            // Si nous sommes actuellement concentrés sur l'entrée de recherche, nous ne voulons pas naviguer
            return;
        }

        switch (event.which) {
            case 78: // n
            case 74: // j
                goToNext();
                break;
            case 66: // b
            case 75: // k
            case 80: // p
                goToPrevious();
                break;
        }
    };
})();

window.addEventListener('keydown', jumpToCode); 