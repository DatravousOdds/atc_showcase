const filterOptions = document.querySelectorAll('.filter-option');
const projects = document.querySelectorAll(".project")
const projectsContainer = document.querySelector('.project-grid');
const projectCount = document.getElementById('showing');

function loadProjects() {
    fetch('/api/projects')
        .then(response => response.json())
        .then(data => {
            console.log("projects data:", data);
            console.log("project count:", data.length);
            projectCount.textContent = `Showing ${data.length} projects`;
            if (data.length > 0) {
               data.forEach(project => {
                console.log("project:", project)
                const projectElement = document.createElement('div');
                projectElement.classList.add('project');
                projectElement.innerHTML = `
                    <div class="project-badge" data-category="${project.project_type.toLowerCase()}">${project.project_type}</div>
                    <img src="${project.project_image_path}" alt="${project.project_title}">
                    <div class="project-information">
                        <h3>${project.project_title}</h3>
                        <p>${project.project_description}</p>
                        <div class="city-state">
                            <div class="city">
                                <i class="fa-solid fa-location-dot"></i> 
                                <span>${project.project_location}</span>
                            </div>
                            <div class="state">
                                <i class="fa-solid fa-calendar-days"></i> 
                                <span>${new Date(project.project_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="project-material">
                            <i class="fa-solid fa-cubes"></i> 
                            <span>${project.project_material}</span>
                        </div>
                    </div>
                `;
                projectsContainer.appendChild(projectElement);
            }); 
            } else {
                projectsContainer.innerHTML = 'No projects found! 🫤';
            }
            
        })
        .catch(error => console.error('Error fetching projects:', error));
} 
function filterProjects(category) {
    
    fetch(`/api/projects?type=${category}`)
        .then(response => response.json())
        .then(data => {
            const totalShown = data.length;
            projectCount.textContent = `Showing ${totalShown} projects`;
            if (totalShown > 0) {
               data.forEach(project => {
                
                const projectElement = document.createElement('div');
                projectElement.classList.add('project');
                projectElement.innerHTML = `
                    <div class="project-badge" data-category="${project.project_type.toLowerCase()}">${project.project_type}</div>
                    <img src="${project.project_image_path}" alt="${project.project_title}">
                    <div class="project-information">
                        <h3>${project.project_title}</h3>
                        <p>${project.project_description}</p>
                        <div class="city-state">
                            <div class="city">
                                <i class="fa-solid fa-location-dot"></i> 
                                <span>${project.project_location}</span>
                            </div>
                            <div class="state">
                                <i class="fa-solid fa-calendar-days"></i> 
                                <span>${new Date(project.project_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div class="project-material">
                            <i class="fa-solid fa-cubes"></i> 
                            <span>${project.project_material}</span>
                        </div>
                    </div>
                `;
                projectsContainer.appendChild(projectElement);
                }); 
            } else {
                projectsContainer.innerHTML = `
                <div style="text-align:center">
                    <p style="font-size:1.5rem">No projects found! 🫤</p>
                </div>`;
                
                
            }
            
        })
        .catch(error => console.error('Error fetching projects:', error));


}

loadProjects();

// =============== INIT EVENT LISTENERS ==========
filterOptions.forEach(option => {
    option.addEventListener('click', () => {
        const filterValue = option.textContent.trim();
        console.log("filter:",filterValue);

        if (filterValue === "all") {
            // Clear existing projects
            projectsContainer.innerHTML = '';
            loadProjects();
            return;
        }

        // Clear existing projects
        projectsContainer.innerHTML = '';

        filterProjects(filterValue);
        
        
    })
})

