
    let data = []; // Holds the asset data
    const selectedTraits = {}; // Stores selected traits for filtering

    // Fetch data from an external JSON file (pmeta2.json)
    async function fetchData() {
        const response = await fetch('ptmeta2.json'); // Path to your external JSON file
        data = await response.json();
        generateFilters(data);
        filterAssets();  // Filter assets initially
    }

    // Function to generate the filter options on the left side
    function generateFilters(data) {
        const traitTypes = {};
        const traitCounts = {}; // Store count of each trait value

        // Group traits by trait_type and count occurrences
        data.forEach(item => {
            item.traits.forEach(trait => {
                if (!traitTypes[trait.trait_type]) {
                    traitTypes[trait.trait_type] = new Set();
                    traitCounts[trait.trait_type] = {}; // Initialize trait count storage
                }
                traitTypes[trait.trait_type].add(trait.value); 

                // Count occurrences of each trait value
                if (!traitCounts[trait.trait_type][trait.value]) {
                    traitCounts[trait.trait_type][trait.value] = 0;
                }
                traitCounts[trait.trait_type][trait.value]++;
            });
        });

        const filterContainer = $('#filter-container');
        filterContainer.empty();  // Clear the filter container before populating it

        // Create filter UI for each trait type
        for (const traitType in traitTypes) {
            const traitValues = [...traitTypes[traitType]].sort(); // Convert Set back to array and sort
            const traitTypeElement = $('<div class="trait-type"></div>').text(traitType);
            const traitListElement = $('<div class="trait-list"></div>');

            traitValues.forEach(value => {
                const count = traitCounts[traitType][value]; // Get count of this trait value
                const traitItem = $(`<div class="trait"></div>`);
                
                // Display count next to the trait value
                const traitLabel = $(`<span>(${count}) ${value}</span>`);
                
                const buttonGroup = $('<div></div>');
                const plusButton = $('<button class="button">+</button>');
                const minusButton = $('<button class="button">-</button>');

                // Set click behavior for the buttons
                plusButton.on('click', () => toggleTrait(traitType, value, 'on', plusButton, minusButton));
                minusButton.on('click', () => toggleTrait(traitType, value, 'exclude', plusButton, minusButton));

                buttonGroup.append(plusButton, minusButton);
                traitItem.append(traitLabel, buttonGroup);
                traitListElement.append(traitItem);
            });

            filterContainer.append(traitTypeElement, traitListElement);
        }
    }

    // Toggle trait states (on or exclude) when a button is clicked
    function toggleTrait(traitType, value, state, plusButton, minusButton) {
        if (!selectedTraits[traitType]) {
            selectedTraits[traitType] = {
                include: new Set(),
                exclude: new Set()
            };
        }

        const isActive = selectedTraits[traitType].include.has(value) || selectedTraits[traitType].exclude.has(value);

        // If it's active and clicked again, disable it (reset the state)
        if (isActive) {
            if (selectedTraits[traitType].include.has(value)) {
                selectedTraits[traitType].include.delete(value);
            }
            if (selectedTraits[traitType].exclude.has(value)) {
                selectedTraits[traitType].exclude.delete(value);
            }

            plusButton.removeClass('green').addClass('black');
            minusButton.removeClass('red').addClass('black');
        } else {
            if (state === 'on') {
                selectedTraits[traitType].include.add(value);
                plusButton.removeClass('black').addClass('green');
                minusButton.removeClass('red').addClass('black');
            } else if (state === 'exclude') {
                selectedTraits[traitType].exclude.add(value);
                minusButton.removeClass('black').addClass('red');
                plusButton.removeClass('green').addClass('black');
            }
        }

        filterAssets();  // Re-filter assets based on the new selection
    }

    // Function to filter assets based on selected traits
    function filterAssets() {
        const filteredAssets = data.filter(item => {
            let matches = true;

            for (const traitType in selectedTraits) {
                const selected = selectedTraits[traitType];
                const itemTraits = item.traits.filter(trait => trait.trait_type === traitType).map(trait => trait.value);

                if ([...selected.exclude].some(value => itemTraits.includes(value))) {
                    matches = false;
                    break;
                }

                if (selected.include.size > 0 && ![...selected.include].some(value => itemTraits.includes(value))) {
                    matches = false;
                    break;
                }
            }

            return matches;
        });

        displayAssets(filteredAssets);  // Display the filtered assets
    }

    // Function to display assets on the right side
    function displayAssets(assets) {
        const rightColumn = $('#right-column');
        rightColumn.empty(); // Clear the assets display

        // Add a count of the filtered assets above the asset grid
        const assetCountText = `Matching Assets: ${assets.length}`;
        const assetCountElement = $('<div class="asset-count"></div>').text(assetCountText);

        rightColumn.append(assetCountElement); // Add count above assets

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const assetElement = entry.target;
                    assetElement.style.opacity = 1; // Fade in the asset
                    observer.unobserve(assetElement);
                }
            });
        }, { rootMargin: '100px' });

        assets.forEach(item => {
            const assetElement = $('<div class="asset"></div>');
            const imageUrl = `https://bafybeiaixko5zrwogs4hyopxld3aliuokinzyg7xernfgeu4vukomrxu6q.ipfs.w3s.link/${item.id}.png`;

            const imageElement = $(`<img data-src="${imageUrl}" alt="${item.name}">`);
            const nameElement = $(`<a href="https://magiceden.us/ordinals/item-details/${item.id}" target="_blank">${item.name}</a>`);

            imageElement[0].src = imageUrl;

            assetElement.append(imageElement, nameElement);
            rightColumn.append(assetElement);

            observer.observe(assetElement[0]);
        });
    }

    // Function to clear all filters
    function clearAllFilters() {
        for (const traitType in selectedTraits) {
            selectedTraits[traitType].include.clear();
            selectedTraits[traitType].exclude.clear();
        }

        $('.button').removeClass('green red').addClass('black');
        filterAssets();
    }

    // Initial fetch of data when the page loads
    fetchData();
