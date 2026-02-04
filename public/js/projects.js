
// ==========================================
// CONFIGURATION & CONSTANTS
// ==========================================
const PROJECT_CONFIG = {
    API_ENDPOINT: '/api/projects',
    FILTER_ALL: 'all',
    DATE_FORMAT_OPTIONS: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }
};

const MESSAGES = {
    NO_PROJECTS: 'No projects found! 🫤',
    ERROR_LOADING: 'Failed to load projects. Please try again later.',
    LOADING: 'Loading projects...'
};

const ProjectDOM = {
    projectsContainer: document.querySelector('.project-grid'),
    projectCount: document.getElementById('showing'),
    filterOptions: document.querySelectorAll('.filter-option'),

    activeFilter: null
};

const ProjectUtils = {
    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('en-US', PROJECT_CONFIG.DATE_FORMAT_OPTIONS);
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString
        }
    },

    sanitize(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    updateProjectCount(count) {
        if (ProjectDOM.projectCount) {
            ProjectDOM.projectCount.textContent = `Showing ${count} project${count !== 1 ? 's': ''}`;
        }
    },

    showLoading() {
        if (ProjectDOM.projectsContainer) {
            ProjectDOM.projectsContainer.innerHTML = `
                <div class="loading-state" style="text-align: center; padding: 2rem; width: 100%;">
                    <p style="font-size: 1.2rem; color: #666;">${MESSAGES.LOADING}</p>
                </div>
            
            `;
        }
    },

    showEmptyState() {
        if (ProjectDOM.projectsContainer) {
            ProjectDOM.projectsContainer.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 2rem; width: 100%;">
                    <p style="font-size: 1.5rem; color: #666;">${MESSAGES.NO_PROJECTS}</p>
                </div>
            `;
        }
        this.updateProjectCount(0);
    },

    showErrorState(message = MESSAGES.ERROR_LOADING) {
        if (ProjectDOM.projectsContainer) {
            ProjectDOM.projectsContainer.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 2rem; width: 100%; color: #dc2626;">

                    <i class="fa-solid fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 0.5rem;"></i>
                </div>
            `;
        }
    },

    clearProjects() {
        if (ProjectDOM.projectsContainer) {
            ProjectDOM.projectsContainer.innerHTML = '';
        }
    }


};

const ProjectRenderer = {
    createProjectHTML(project) {
        const {
            project_type = 'Unknown',
            project_image_path = '',
            project_title = 'Untitled',
            project_description = '',
            project_location = 'Unknown',
            project_date = new Date(),
            project_material = 'N/A'
        } = project;

        return `
            <div class="project-badge" date-category="${ProjectUtils.sanitize(project_type.toLowerCase())}">
                ${ProjectUtils.sanitize(project_type)}
            </div>
            <img src="${ProjectUtils.sanitize(project_image_path)}"
                alt="${ProjectUtils.sanitize(project_title)}"
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2220%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3EImage not found%3C/text%3E%3C/svg%3E'">
            <div class="project-information">
                <h3>${ProjectUtils.sanitize(project_title)}</h3>
                <p>${ProjectUtils.sanitize(project_description)}</p>
                <div class="city-state">
                    <div class="city">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>${ProjectUtils.sanitize(project_location)}</span>
                    </div>
                    <div class="state">
                        <i class="fa-solid fa-calendar-dot"></i>
                        <span>${ProjectUtils.formatDate(project_date)}</span>
                    </div>
                </div>
                    <div class="project-material" style="margin-top:0.5rem;">
                        <i class="fa-solid fa-cubes"></i>
                        <span>${ProjectUtils.sanitize(project_material)}</span>
                    </div>
            </div> 
        `;
    },

    renderProject(project) {
        const projectElement = document.createElement('div');
        projectElement.classList.add('project');
        projectElement.innerHTML = this.createProjectHTML(project);

        // fade-in animation
        projectElement.style.opacity = '0';
        ProjectDOM.projectsContainer.appendChild(projectElement);

        // Trigger animation after small delay
        requestAnimationFrame(() => {
            projectElement.style.transition = 'opacity 0.3s ease-in';
            projectElement.style.opacity = '1';
        });
    },

    renderProjects(projects) {
        if (!projects || projects.length === 0) {
            ProjectUtils.showEmptyState();
            return;
        }

        ProjectUtils.clearProjects();

        const fragment = document.createDocumentFragment();

        projects.forEach((project, index) => {
            const projectElement = document.createElement('div');
            projectElement.classList.add('project');
            projectElement.innerHTML = this.createProjectHTML(project);

            // stagger animation
            projectElement.style.opacity = '0';
            projectElement.style.animation = `fadeIn 0.5s ease-in ${index * 0.05}s forwards`;

            fragment.appendChild(projectElement);
        });

        ProjectDOM.projectsContainer.appendChild(fragment);
        ProjectUtils.updateProjectCount(projects.length);
    }
};

const ProjectAPI = {
    async fetchProjects(filterType = null) {
        const url = filterType
            ? `${PROJECT_CONFIG.API_ENDPOINT}?type=${encodeURIComponent(filterType)}`
            : PROJECT_CONFIG.API_ENDPOINT;
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Fetched ${data.length} project(s)${filterType ? ` for filter: ${filterType}` : ''
                }`)

            return data;
        } catch (error) {
            console.log('Error fetching projects:', error);
            throw error;
        }
    }
}

const ProjectFilterManager = {
    init() {
        this.bindFilterEvents();
        this.loadAllProjects();
    },

    bindFilterEvents() {
        ProjectDOM.filterOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                this.handleFilterClick(option);
            });
        });
    },

    async handleFilterClick(option) {
        const filterValue = option.textContent.trim().toLowerCase();
        console.log('Filter selected: ', filterValue);

        this.setActiveFilter(option);

        if (filterValue === PROJECT_CONFIG.FILTER_ALL) {
            await this.loadAllProjects();
        } else {
            await this.loadFilteredProjects(filterValue);
        }
    },

    setActiveFilter(activeOption) {
        ProjectDOM.filterOptions.forEach(opt => {
            opt.classList.remove('active');
        });
        activeOption.classList.add('active');
        ProjectDOM.activeFilter = activeOption;
    },

    async loadAllProjects() {
        ProjectUtils.showLoading();

        try {
            const projects = await ProjectAPI.fetchProjects();
            ProjectRenderer.renderProjects(projects);
        } catch (error) {
            ProjectUtils.showErrorState();
        }
    },

    async loadFilteredProjects(category) {
        ProjectUtils.showLoading();

        try {
            const projects = await ProjectAPI.fetchProjects(category);
            console.log("fetched projects:", projects)
            ProjectRenderer.renderProjects(projects);
        } catch (error) {
            ProjectUtils.showErrorState();
        }
    }
};

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0)
        }
    }
`;
document.head.appendChild(style);

function initProjects() {
    console.log('🎨 Initializing project filtering system...');

    if (!ProjectDOM.projectsContainer) {
        console.error('Project container not found!');
        return;
    }

    ProjectFilterManager.init();

    console.log('✅ Project filtering system initialized');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjects);
} else {
    initProjects();
}