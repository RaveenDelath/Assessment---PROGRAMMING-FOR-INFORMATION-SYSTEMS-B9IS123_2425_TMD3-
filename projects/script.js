// Simple Projects Class
class Projects {
    constructor() {
        this.projects = [];
        this.nextId = 1;
        this.currentPage = 1;
        this.projectsPerPage = 5;
        this.filteredProjects = [];
        this.loadSampleData();
    }

    // Load sample data
    loadSampleData() {
        const samples = [
            { name: "Kitchen Renovation", client: "Noah Mitchell", status: "In Progress", budget: 25000, startDate: "2024-01-15", endDate: "2024-03-15", location: "123 Main St", description: "Complete kitchen remodeling" },
            { name: "Bathroom Remodel", client: "Zoe Robinson", status: "Planning", budget: 15000, startDate: "2024-03-01", endDate: "2024-04-30", location: "456 Oak Ave", description: "Modern bathroom renovation" },
            { name: "Living Room Makeover", client: "Nora O’Brien", status: "Completed", budget: 12000, startDate: "2023-11-01", endDate: "2023-12-15", location: "789 Pine St", description: "Living room transformation" }
        ];

        samples.forEach(project => this.createProject(project));
    }

    // Create new project
    createProject(data) {
        const project = {
            id: this.nextId++,
            name: data.name,
            client: data.client,
            description: data.description || '',
            status: data.status || 'Planning',
            budget: parseFloat(data.budget) || 0,
            startDate: data.startDate || '',
            endDate: data.endDate || '',
            location: data.location || '',
            createdAt: new Date().toISOString()
        };
        this.projects.push(project);
        return project;
    }

    // Get all projects with filtering
    getAllProjects(filters = {}) {
        let filtered = [...this.projects];

        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(search) ||
                p.client.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search)
            );
        }

        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }

        this.filteredProjects = filtered;
        return this.getPaginatedProjects();
    }

    // Get paginated projects
    getPaginatedProjects() {
        const start = (this.currentPage - 1) * this.projectsPerPage;
        const end = start + this.projectsPerPage;
        return {
            projects: this.filteredProjects.slice(start, end),
            totalPages: Math.ceil(this.filteredProjects.length / this.projectsPerPage),
            currentPage: this.currentPage,
            total: this.filteredProjects.length
        };
    }

    // Get project by ID
    getProjectById(id) {
        return this.projects.find(p => p.id === parseInt(id));
    }

    // Update project
    updateProject(id, data) {
        const index = this.projects.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            this.projects[index] = { ...this.projects[index], ...data };
            return this.projects[index];
        }
        return null;
    }

    // Partial update
    partialUpdate(id, updates) {
        const project = this.getProjectById(id);
        if (project) {
            Object.assign(project, updates);
            return project;
        }
        return null;
    }

    // Delete project
    deleteProject(id) {
        const index = this.projects.findIndex(p => p.id === parseInt(id));
        if (index !== -1) {
            return this.projects.splice(index, 1)[0];
        }
        return null;
    }

    // Set current page
    setPage(page) {
        this.currentPage = page;
    }
}

// Initialize
const projectManager = new Projects();
let editingProjectId = null;

// Load projects on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
});

// Load and display projects
function loadProjects() {
    const filters = {
        search: document.getElementById('searchInput').value,
        status: document.getElementById('statusFilter').value
    };

    const result = projectManager.getAllProjects(filters);
    displayProjects(result.projects);
    displayPagination(result);
}

// Display projects in table
function displayProjects(projects) {
    const tbody = document.getElementById('projectsBody');
    
    if (projects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="no-projects">No projects found</td></tr>';
        return;
    }

    tbody.innerHTML = projects.map(project => `
        <tr>
            <td><strong>${project.name}</strong></td>
            <td>${project.client}</td>
            <td><span class="status-badge status-${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span></td>
            <td>$${project.budget.toLocaleString()}</td>
            <td>${project.startDate || 'Not set'}</td>
            <td>
                <button onclick="viewProject(${project.id})">View</button>
                <button onclick="editProject(${project.id})">Edit</button>
                <button onclick="deleteProjectConfirm(${project.id})" class="btn-danger">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Display pagination
function displayPagination(result) {
    const container = document.getElementById('pagination');
    
    if (result.totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';
    
    if (result.currentPage > 1) {
        html += `<button onclick="goToPage(${result.currentPage - 1})">Previous</button>`;
    }

    for (let i = 1; i <= result.totalPages; i++) {
        if (i === result.currentPage) {
            html += `<button style="background: #0056b3;">${i}</button>`;
        } else {
            html += `<button onclick="goToPage(${i})">${i}</button>`;
        }
    }

    if (result.currentPage < result.totalPages) {
        html += `<button onclick="goToPage(${result.currentPage + 1})">Next</button>`;
    }

    container.innerHTML = html;
}

// Pagination navigation
function goToPage(page) {
    projectManager.setPage(page);
    loadProjects();
}

// Apply filters
function applyFilters() {
    projectManager.setPage(1);
    loadProjects();
}

// Clear filters
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    applyFilters();
}

// Open add modal
function openAddModal() {
    editingProjectId = null;
    document.getElementById('modalTitle').textContent = 'Add New Project';
    document.getElementById('projectForm').reset();
    document.getElementById('projectId').value = '';
    document.getElementById('projectModal').style.display = 'block';
}

// Edit project
function editProject(id) {
    const project = projectManager.getProjectById(id);
    if (!project) return;

    editingProjectId = id;
    document.getElementById('modalTitle').textContent = 'Edit Project';
    document.getElementById('projectId').value = project.id;
    document.getElementById('projectName').value = project.name;
    document.getElementById('clientName').value = project.client;
    document.getElementById('description').value = project.description;
    document.getElementById('status').value = project.status;
    document.getElementById('budget').value = project.budget;
    document.getElementById('startDate').value = project.startDate;
    document.getElementById('endDate').value = project.endDate;
    document.getElementById('location').value = project.location;
    
    document.getElementById('projectModal').style.display = 'block';
}

// Save project
function saveProject() {
    const formData = {
        name: document.getElementById('projectName').value,
        client: document.getElementById('clientName').value,
        description: document.getElementById('description').value,
        status: document.getElementById('status').value,
        budget: parseFloat(document.getElementById('budget').value) || 0,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        location: document.getElementById('location').value
    };

    if (!formData.name || !formData.client) {
        alert('Please fill in required fields');
        return;
    }

    if (editingProjectId) {
        projectManager.updateProject(editingProjectId, formData);
    } else {
        projectManager.createProject(formData);
    }

    closeModal();
    loadProjects();
}

// View project details
function viewProject(id) {
    const project = projectManager.getProjectById(id);
    if (!project) return;

    const details = `
        <div style="line-height: 1.6;">
            <p><strong>Project Name:</strong> ${project.name}</p>
            <p><strong>Client:</strong> ${project.client}</p>
            <p><strong>Description:</strong> ${project.description || 'No description'}</p>
            <p><strong>Status:</strong> <span class="status-badge status-${project.status.toLowerCase().replace(' ', '-')}">${project.status}</span></p>
            <p><strong>Budget:</strong> $${project.budget.toLocaleString()}</p>
            <p><strong>Start Date:</strong> ${project.startDate || 'Not set'}</p>
            <p><strong>End Date:</strong> ${project.endDate || 'Not set'}</p>
            <p><strong>Location:</strong> ${project.location || 'Not specified'}</p>
            <p><strong>Created:</strong> ${new Date(project.createdAt).toLocaleString()}</p>
        </div>
    `;

    document.getElementById('projectDetails').innerHTML = details;
    document.getElementById('detailModal').style.display = 'block';
}

// Delete project with confirmation
function deleteProjectConfirm(id) {
    const project = projectManager.getProjectById(id);
    if (!project) return;

    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
        projectManager.deleteProject(id);
        loadProjects();
    }
}

// Close modals
function closeModal() {
    document.getElementById('projectModal').style.display = 'none';
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const projectModal = document.getElementById('projectModal');
    const detailModal = document.getElementById('detailModal');
    
    if (event.target === projectModal) {
        closeModal();
    }
    if (event.target === detailModal) {
        closeDetailModal();
    }
}