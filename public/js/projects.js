const filterOptions = document.querySelectorAll('.filter-option');
const projects = document.querySelectorAll(".project")
const projectsContainer = document.querySelector('.project-grid');





console.log("filter options:",filterOptions);

filterOptions.forEach(option => {
    option.addEventListener('click', () => {
        console.log("project length:", projects.length)
        const filterValue = option.textContent.trim();
        console.log("filter:",filterValue)

        projects.forEach(project => {
            const badge = project.querySelector('.project-badge');
            const category = badge.dataset.category.toLowerCase();
            console.log("category",category)
            
            if (filterValue === 'all' || category === filterValue ) {
                project.style.display = 'block';
            } else {
                
                project.style.display = 'none';
            }

        })

        
        
    })
})