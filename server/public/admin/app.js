document.addEventListener('DOMContentLoaded', () => {
	// First create the login modal in the DOM
	createLoginModal();

	// Check authentication and show/hide login modal accordingly
	checkAuthentication()
		.then((isAuthenticated) => {
			if (isAuthenticated) {
				// User is authenticated, initialize the dashboard
				hideLoginModal();
				initializeApp();
			} else {
				// User is not authenticated, show login modal
				showLoginModal();
			}
		})
		.catch((error) => {
			console.error('Authentication check failed:', error);
			// If there's an error, show login modal as a fallback
			showLoginModal();
		});
});

// Create and append login modal to the DOM
function createLoginModal() {
	const modalHtml = `
		<div id="login-modal" class="modal login-modal active">
			<div class="modal-content login-card">
				<div class="login-header">
					<h1>Quizify</h1>
					<p>Admin Dashboard Login</p>
				</div>
				
				<form id="login-form" class="login-form">
					<div class="form-group">
						<label for="email">Email:</label>
						<input type="email" id="email" name="email" value="admin@quizify.com" required>
					</div>

					<div class="form-group">
						<label for="password">Password:</label>
						<input type="password" id="password" name="password" value="admin123" required>
					</div>

					<div class="error-message" id="login-error"></div>

					<div class="login-actions">
						<button type="submit" class="btn btn-primary btn-block">Login</button>
					</div>
				</form>

				<div class="debug-info" id="debug-info"></div>
			</div>
		</div>
		
		<div id="loading-overlay" class="loading-overlay">
			<div class="spinner"></div>
		</div>
	`;

	// Append to body
	document.body.insertAdjacentHTML('beforeend', modalHtml);

	// Add event listener for login form
	document
		.getElementById('login-form')
		.addEventListener('submit', async (e) => {
			e.preventDefault();
			document.getElementById('loading-overlay').style.display = 'flex';

			const email = document.getElementById('email').value;
			const password = document.getElementById('password').value;

			// Hide any previous error messages
			const loginError = document.getElementById('login-error');
			loginError.classList.remove('active');

			try {
				const response = await fetch('/api/v1/auth/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': 'no-cache, no-store, must-revalidate',
						Pragma: 'no-cache',
						Expires: '0',
					},
					body: JSON.stringify({ email, password }),
					credentials: 'include',
				});

				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.message || 'Login failed');
				}

				const data = await response.json();

				// Check if user is admin
				if (!data.user.isAdmin) {
					throw new Error('Admin access required');
				}

				// Hide login modal and show dashboard
				hideLoginModal();
				initializeApp();
			} catch (error) {
				// Show error message
				loginError.textContent = error.message;
				loginError.classList.add('active');
				document.getElementById('loading-overlay').style.display = 'none';
			}
		});
}

// Show login modal
function showLoginModal() {
	const modal = document.getElementById('login-modal');
	if (modal) {
		modal.classList.add('active');
		// Display debug info
		const debugInfo = document.getElementById('debug-info');
		if (debugInfo) {
			debugInfo.style.display = 'block';
			debugInfo.innerHTML = `
				<p>URL: ${window.location.href}</p>
				<p>Time: ${new Date().toString()}</p>
			`;
		}
	}
}

// Hide login modal
function hideLoginModal() {
	const modal = document.getElementById('login-modal');
	if (modal) {
		modal.classList.remove('active');
	}
	document.getElementById('loading-overlay').style.display = 'none';
}

// Base URL for API calls
const API_BASE_URL = '/api/v1/admin';

// Global state
const state = {
	quizzes: [],
	categories: new Set(),
	currentPage: 1,
	pageSize: 10,
	totalPages: 1,
	currentQuiz: null,
	isEditing: false,
	questionCount: 0,
	currentPath: [],
};

// Check authentication status
async function checkAuthentication() {
	try {
		const response = await fetch(`${API_BASE_URL}/dashboard`, {
			method: 'HEAD',
			credentials: 'include',
			headers: {
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				Pragma: 'no-cache',
				Expires: '0',
			},
		});
		return response.ok;
	} catch (error) {
		console.error('Authentication check failed:', error);
		return false;
	}
}

// Initialize the app
function initializeApp() {
	// Setup navigation
	setupNavigation();

	// Setup event listeners
	setupEventListeners();

	// Create breadcrumbs
	createBreadcrumbs(['Dashboard']);

	// Setup search functionality
	setupSearch();

	// Load initial data
	loadDashboardData();
}

// Setup navigation
function setupNavigation() {
	const navItems = document.querySelectorAll('.nav-menu li');
	navItems.forEach((item) => {
		item.addEventListener('click', () => {
			const pageId = item.getAttribute('data-page');

			// Handle logout separately
			if (pageId === 'logout') {
				handleLogout();
				return;
			}

			// Update active navigation item
			navItems.forEach((navItem) => navItem.classList.remove('active'));
			item.classList.add('active');

			// Show the selected page
			const pages = document.querySelectorAll('.page');
			pages.forEach((page) => page.classList.remove('active'));
			document.getElementById(`${pageId}-page`).classList.add('active');

			// Update breadcrumbs
			updateBreadcrumbsForPage(pageId);

			// Load page specific data
			if (pageId === 'dashboard') {
				loadDashboardData();
			} else if (pageId === 'quizzes') {
				loadQuizzes();
			}
		});
	});
}

// Handle logout
async function handleLogout() {
	try {
		const response = await fetch('/api/v1/auth/logout', {
			method: 'DELETE',
			credentials: 'include',
		});

		if (response.ok) {
			// Show login modal instead of redirecting
			showLoginModal();
		}
	} catch (error) {
		console.error('Logout failed:', error);
		alert('Failed to logout. Please try again.');
	}
}

// Setup search functionality
function setupSearch() {
	const searchInput = document.querySelector('.search-bar input');
	searchInput.addEventListener('keypress', (e) => {
		if (e.key === 'Enter') {
			const query = searchInput.value.trim();
			if (query) {
				// Get the current active page
				const activePage = document.querySelector('.page.active').id;

				if (activePage === 'quizzes-page') {
					document.getElementById('quiz-search').value = query;
					state.currentPage = 1;
					loadQuizzes();
				} else if (activePage === 'dashboard-page') {
					// Switch to quizzes page and perform search
					document.querySelector('.nav-menu li[data-page="quizzes"]').click();
					document.getElementById('quiz-search').value = query;
					state.currentPage = 1;
					loadQuizzes();
				}
			}
		}
	});
}

// Create breadcrumbs
function createBreadcrumbs(paths) {
	// Check if breadcrumbs container already exists
	let breadcrumbsContainer = document.querySelector('.breadcrumbs');

	if (!breadcrumbsContainer) {
		// Create breadcrumbs container if it doesn't exist
		breadcrumbsContainer = document.createElement('div');
		breadcrumbsContainer.className = 'breadcrumbs';

		// Insert breadcrumbs after top-header
		const topHeader = document.querySelector('.top-header');
		topHeader.parentNode.insertBefore(
			breadcrumbsContainer,
			topHeader.nextSibling
		);
	}

	state.currentPath = paths;
	renderBreadcrumbs();
}

// Render breadcrumbs based on current path
function renderBreadcrumbs() {
	const container = document.querySelector('.breadcrumbs');
	container.innerHTML = '';

	state.currentPath.forEach((path, index) => {
		const breadcrumb = document.createElement('span');
		breadcrumb.className = 'breadcrumb-item';
		breadcrumb.textContent = path;

		if (index < state.currentPath.length - 1) {
			breadcrumb.classList.add('clickable');
			breadcrumb.addEventListener('click', () => {
				// Navigate back to this breadcrumb level
				handleBreadcrumbClick(index);
			});
		} else {
			breadcrumb.classList.add('active');
		}

		container.appendChild(breadcrumb);

		if (index < state.currentPath.length - 1) {
			const separator = document.createElement('span');
			separator.className = 'breadcrumb-separator';
			separator.innerHTML = '<i class="fas fa-chevron-right"></i>';
			container.appendChild(separator);
		}
	});
}

// Handle breadcrumb click
function handleBreadcrumbClick(index) {
	const path = state.currentPath[index];
	let pageId;

	// Determine which page to navigate to based on the breadcrumb text
	switch (path) {
		case 'Dashboard':
			pageId = 'dashboard';
			break;
		case 'Quizzes':
			pageId = 'quizzes';
			break;
		case 'Settings':
			pageId = 'settings';
			break;
		default:
			pageId = 'dashboard';
	}

	// Click the corresponding nav item
	document.querySelector(`.nav-menu li[data-page="${pageId}"]`).click();
}

// Update breadcrumbs based on the current page
function updateBreadcrumbsForPage(pageId) {
	switch (pageId) {
		case 'dashboard':
			createBreadcrumbs(['Dashboard']);
			break;
		case 'quizzes':
			createBreadcrumbs(['Dashboard', 'Quizzes']);
			break;
		case 'create-quiz':
			const title = state.isEditing ? 'Edit Quiz' : 'Create Quiz';
			createBreadcrumbs(['Dashboard', 'Quizzes', title]);
			break;
		case 'settings':
			createBreadcrumbs(['Dashboard', 'Settings']);
			break;
		default:
			createBreadcrumbs(['Dashboard']);
	}
}

// Setup event listeners
function setupEventListeners() {
	// View all quizzes button
	document.getElementById('view-all-quizzes').addEventListener('click', () => {
		// Switch to quizzes page
		document.querySelector('.nav-menu li[data-page="quizzes"]').click();
	});

	// Add new quiz button
	document.getElementById('add-quiz-btn').addEventListener('click', () => {
		// Switch to create quiz page
		document.querySelector('.nav-menu li[data-page="create-quiz"]').click();
		// Reset form for new quiz
		resetQuizForm();
	});

	// Cancel quiz button
	document.getElementById('cancel-quiz-btn').addEventListener('click', () => {
		// Go back to quizzes page
		document.querySelector('.nav-menu li[data-page="quizzes"]').click();
	});

	// Add question button
	document.getElementById('add-question-btn').addEventListener('click', () => {
		addNewQuestion();
	});

	// Quiz form submission
	document.getElementById('quiz-form').addEventListener('submit', (e) => {
		e.preventDefault();
		saveQuiz();
	});

	// Pagination buttons
	document.getElementById('prev-page').addEventListener('click', () => {
		if (state.currentPage > 1) {
			state.currentPage--;
			loadQuizzes();
		}
	});

	document.getElementById('next-page').addEventListener('click', () => {
		if (state.currentPage < state.totalPages) {
			state.currentPage++;
			loadQuizzes();
		}
	});

	// Search button
	document.getElementById('search-btn').addEventListener('click', () => {
		state.currentPage = 1;
		loadQuizzes();
	});

	// Filter change events
	document.getElementById('category-filter').addEventListener('change', () => {
		state.currentPage = 1;
		loadQuizzes();
	});

	document
		.getElementById('difficulty-filter')
		.addEventListener('change', () => {
			state.currentPage = 1;
			loadQuizzes();
		});

	// Import/Export buttons
	document
		.getElementById('import-quizzes-btn')
		.addEventListener('click', () => {
			importQuizzes();
		});

	document
		.getElementById('export-quizzes-btn')
		.addEventListener('click', () => {
			exportQuizzes();
		});

	// Database action buttons
	document.getElementById('backup-db-btn').addEventListener('click', () => {
		backupDatabase();
	});

	document.getElementById('reset-db-btn').addEventListener('click', () => {
		resetDatabase();
	});

	// Modal close button
	const closeModalBtns = document.querySelectorAll(
		'.close-modal-btn, #cancel-delete-btn'
	);
	closeModalBtns.forEach((btn) => {
		btn.addEventListener('click', () => {
			const modals = document.querySelectorAll('.modal');
			modals.forEach((modal) => modal.classList.remove('active'));
		});
	});

	// Delete confirmation
	document
		.getElementById('confirm-delete-btn')
		.addEventListener('click', () => {
			if (state.currentQuiz) {
				deleteQuiz(state.currentQuiz._id);
			}
		});
}

// Load dashboard data
function loadDashboardData() {
	// Fetch dashboard statistics
	fetch(`${API_BASE_URL}/dashboard`, {
		credentials: 'include',
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Failed to fetch dashboard data');
			}
			return response.json();
		})
		.then((data) => {
			// Update statistics
			document.getElementById('quiz-count').textContent = data.totalQuizzes;

			// Calculate total questions
			const questionCount = data.totalQuestions || state.questionCount || 0;
			document.getElementById('question-count').textContent = questionCount;

			// Update user count
			const userCountElement = document.querySelector(
				'.stat-card:nth-child(3) .stat-card-value'
			);
			userCountElement.textContent = data.totalUsers;

			// Load recent quizzes
			loadRecentQuizzes();
		})
		.catch((error) => {
			console.error('Error loading dashboard data:', error);
		});
}

// Load quizzes with pagination and filtering
function loadQuizzes() {
	const categoryFilter = document.getElementById('category-filter').value;
	const difficultyFilter = document.getElementById('difficulty-filter').value;
	const searchQuery = document.getElementById('quiz-search').value;

	// Show loading state
	const tableBody = document.querySelector('#quizzes-table tbody');
	tableBody.innerHTML =
		'<tr><td colspan="6" class="text-center">Loading...</td></tr>';

	// Build query parameters
	const params = new URLSearchParams({
		page: state.currentPage.toString(),
		limit: state.pageSize.toString(),
	});

	if (categoryFilter) {
		params.append('category', categoryFilter);
	}

	if (difficultyFilter) {
		params.append('difficulty', difficultyFilter);
	}

	if (searchQuery) {
		params.append('search', searchQuery);
	}

	fetch(`${API_BASE_URL}/quizzes?${params.toString()}`, {
		credentials: 'include',
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Failed to fetch quizzes');
			}
			return response.json();
		})
		.then((data) => {
			state.quizzes = data.quizzes;
			state.totalPages = data.totalPages;

			// Update pagination info
			document.getElementById('current-page').textContent = state.currentPage;
			document.getElementById('total-pages').textContent = state.totalPages;

			// Render quizzes table
			renderQuizzesTable(state.quizzes);

			// Update category filter options if needed
			updateCategoryOptions(state.quizzes);
		})
		.catch((error) => {
			console.error('Error loading quizzes:', error);
			tableBody.innerHTML =
				'<tr><td colspan="6" class="text-center">Error loading quizzes. Please try again.</td></tr>';
		});
}

// Load recent quizzes for dashboard
function loadRecentQuizzes() {
	fetch(`${API_BASE_URL}/quizzes?page=1&limit=5`, {
		credentials: 'include',
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error('Failed to fetch recent quizzes');
			}
			return response.json();
		})
		.then((data) => {
			renderRecentQuizzesTable(data.quizzes);
		})
		.catch((error) => {
			console.error('Error loading recent quizzes:', error);
			const tableBody = document.querySelector('#recent-quizzes-table tbody');
			tableBody.innerHTML =
				'<tr><td colspan="5" class="text-center">Error loading recent quizzes</td></tr>';
		});
}

// Render quizzes table
function renderQuizzesTable(quizzes) {
	const tableBody = document.querySelector('#quizzes-table tbody');
	tableBody.innerHTML = '';

	if (quizzes.length === 0) {
		const row = document.createElement('tr');
		row.innerHTML = `<td colspan="6" class="text-center">No quizzes found</td>`;
		tableBody.appendChild(row);
		return;
	}

	quizzes.forEach((quiz) => {
		const row = document.createElement('tr');
		row.innerHTML = `
			<td>${quiz.title}</td>
			<td>${quiz.category}</td>
			<td>${quiz.difficulty}</td>
			<td>${quiz.questions ? quiz.questions.length : 0}</td>
			<td>${formatDate(quiz.createdAt)}</td>
			<td class="actions">
				<button class="btn btn-sm btn-outline edit-quiz" data-id="${quiz._id}">
					<i class="fas fa-edit"></i>
				</button>
				<button class="btn btn-sm btn-danger delete-quiz" data-id="${quiz._id}">
					<i class="fas fa-trash"></i>
				</button>
			</td>
		`;
		tableBody.appendChild(row);

		// Add event listeners to action buttons
		row.querySelector('.edit-quiz').addEventListener('click', () => {
			editQuiz(quiz._id);
		});

		row.querySelector('.delete-quiz').addEventListener('click', () => {
			showDeleteConfirmation(quiz);
		});
	});
}

// Render recent quizzes table
function renderRecentQuizzesTable(quizzes) {
	const tableBody = document.querySelector('#recent-quizzes-table tbody');
	tableBody.innerHTML = '';

	if (quizzes.length === 0) {
		const row = document.createElement('tr');
		row.innerHTML = `<td colspan="5" class="text-center">No quizzes found</td>`;
		tableBody.appendChild(row);
		return;
	}

	quizzes.forEach((quiz) => {
		const row = document.createElement('tr');
		row.innerHTML = `
			<td>${quiz.title}</td>
			<td>${quiz.category}</td>
			<td>${quiz.questions ? quiz.questions.length : 0}</td>
			<td>${formatDate(quiz.createdAt)}</td>
			<td class="actions">
				<button class="btn btn-sm btn-outline view-quiz" data-id="${quiz._id}">
					<i class="fas fa-eye"></i>
				</button>
			</td>
		`;
		tableBody.appendChild(row);

		// Add event listener to view button
		row.querySelector('.view-quiz').addEventListener('click', () => {
			editQuiz(quiz._id);
		});
	});
}

// Update category options in filter
function updateCategoryOptions(quizzes) {
	// Fetch all categories from server
	fetch(`${API_BASE_URL}/quizzes/categories`, {
		credentials: 'include',
	})
		.then((response) => {
			if (!response.ok) {
				// Extract categories from quizzes as fallback
				quizzes.forEach((quiz) => {
					if (quiz.category) {
						state.categories.add(quiz.category);
					}
				});
				return { categories: Array.from(state.categories) };
			}
			return response.json();
		})
		.then((data) => {
			const categories = data.categories || Array.from(state.categories);

			// Update filter dropdown
			const categorySelect = document.getElementById('category-filter');

			// Clear existing options except the first one
			while (categorySelect.options.length > 1) {
				categorySelect.remove(1);
			}

			// Add category options
			categories.forEach((category) => {
				const option = document.createElement('option');
				option.value = category;
				option.textContent = category;
				categorySelect.appendChild(option);
			});

			// Also update category datalist for the create/edit form
			updateCategoryDatalist(categories);
		})
		.catch((error) => {
			console.error('Error fetching categories:', error);
		});
}

// Update category datalist for the quiz form
function updateCategoryDatalist(categories) {
	// Get or create datalist
	let categoryDatalist = document.getElementById('category-options');

	if (!categoryDatalist) {
		categoryDatalist = document.createElement('datalist');
		categoryDatalist.id = 'category-options';
		document.body.appendChild(categoryDatalist);

		// Connect the input to the datalist
		const categoryInput = document.getElementById('quiz-category');
		categoryInput.setAttribute('list', 'category-options');
	}

	// Clear existing options
	categoryDatalist.innerHTML = '';

	// Add category options
	categories.forEach((category) => {
		const option = document.createElement('option');
		option.value = category;
		categoryDatalist.appendChild(option);
	});
}

// Add new question to form
function addNewQuestion() {
	const questionTemplate = document.getElementById('question-template');
	const questionsContainer = document.getElementById('questions-container');

	// Clone the template
	const newQuestion = document.importNode(questionTemplate.content, true);

	// Set question number
	const questionCount = questionsContainer.children.length + 1;
	newQuestion.querySelector('.question-number').textContent = questionCount;

	// Set unique name for radio buttons
	const radios = newQuestion.querySelectorAll('input[type="radio"]');
	const inputs = newQuestion.querySelectorAll('.option-text');

	radios.forEach((radio, index) => {
		radio.name = `correctOption_${questionCount - 1}`;
		radio.value = index;
	});

	inputs.forEach((input, index) => {
		input.name = `options_${questionCount - 1}[]`;
		input.placeholder = `Option ${index + 1}`;
	});

	// Add remove question event listener
	newQuestion
		.querySelector('.remove-question-btn')
		.addEventListener('click', function () {
			this.closest('.question-item').remove();
			// Update question numbers
			const questions = questionsContainer.querySelectorAll('.question-item');
			questions.forEach((question, index) => {
				question.querySelector('.question-number').textContent = index + 1;

				// Update radio names
				const radios = question.querySelectorAll('input[type="radio"]');
				radios.forEach((radio) => {
					radio.name = `correctOption_${index}`;
				});

				// Update option names
				const inputs = question.querySelectorAll('.option-text');
				inputs.forEach((input) => {
					input.name = `options_${index}[]`;
				});
			});
		});

	// Append the new question
	questionsContainer.appendChild(newQuestion);
}

// Save quiz
function saveQuiz() {
	const quizForm = document.getElementById('quiz-form');
	const quizId = document.getElementById('quiz-id').value;

	// Validate form
	if (!quizForm.checkValidity()) {
		quizForm.reportValidity();
		return;
	}

	// Get basic quiz data
	const quizData = {
		title: document.getElementById('quiz-title').value,
		category: document.getElementById('quiz-category').value,
		difficulty: document.getElementById('quiz-difficulty').value,
		description: document.getElementById('quiz-description').value,
		questions: [],
	};

	// Get questions data
	const questionItems = document.querySelectorAll('.question-item');
	questionItems.forEach((item, index) => {
		const questionText = item.querySelector('.question-text').value;
		const options = Array.from(item.querySelectorAll('.option-text')).map(
			(input) => input.value
		);
		const correctOptionIndex = parseInt(
			item.querySelector('input[type="radio"]:checked').value
		);

		quizData.questions.push({
			questionText,
			options,
			correctOptionIndex,
		});
	});

	// Show saving indicator
	const saveButton = document.getElementById('save-quiz-btn');
	const originalText = saveButton.textContent;
	saveButton.textContent = 'Saving...';
	saveButton.disabled = true;

	// Send request to create/update quiz
	if (state.isEditing && quizId) {
		updateQuiz(quizId, quizData)
			.then(() => {
				// Show success message and return to quizzes page
				saveButton.textContent = originalText;
				saveButton.disabled = false;
				alert('Quiz updated successfully!');
				document.querySelector('.nav-menu li[data-page="quizzes"]').click();
			})
			.catch((error) => {
				saveButton.textContent = originalText;
				saveButton.disabled = false;
				alert(`Error updating quiz: ${error.message}`);
			});
	} else {
		createQuiz(quizData)
			.then(() => {
				// Show success message and return to quizzes page
				saveButton.textContent = originalText;
				saveButton.disabled = false;
				alert('Quiz created successfully!');
				document.querySelector('.nav-menu li[data-page="quizzes"]').click();
			})
			.catch((error) => {
				saveButton.textContent = originalText;
				saveButton.disabled = false;
				alert(`Error creating quiz: ${error.message}`);
			});
	}
}

// Reset quiz form
function resetQuizForm() {
	document.getElementById('form-title').textContent = 'Create New Quiz';
	document.getElementById('quiz-form').reset();
	document.getElementById('quiz-id').value = '';
	document.getElementById('questions-container').innerHTML = '';
	state.isEditing = false;

	// Add an initial question
	addNewQuestion();

	// Update breadcrumbs
	createBreadcrumbs(['Dashboard', 'Quizzes', 'Create Quiz']);
}

// Edit quiz
function editQuiz(quizId) {
	// Switch to create quiz page
	document.querySelector('.nav-menu li[data-page="create-quiz"]').click();

	// Set form title
	document.getElementById('form-title').textContent = 'Edit Quiz';

	// Show loading state
	document.getElementById('questions-container').innerHTML =
		'<div class="loading">Loading quiz data...</div>';

	// Fetch quiz data
	fetchQuizById(quizId)
		.then((quiz) => {
			// Save current quiz
			state.currentQuiz = quiz;
			state.isEditing = true;

			// Populate form
			document.getElementById('quiz-id').value = quiz._id;
			document.getElementById('quiz-title').value = quiz.title;
			document.getElementById('quiz-category').value = quiz.category;
			document.getElementById('quiz-difficulty').value = quiz.difficulty;
			document.getElementById('quiz-description').value =
				quiz.description || '';

			// Clear existing questions
			document.getElementById('questions-container').innerHTML = '';

			// Add questions
			if (quiz.questions && quiz.questions.length > 0) {
				quiz.questions.forEach((question) => {
					addQuestionToForm(question);
				});
			} else {
				// Add an empty question if none exist
				addNewQuestion();
			}

			// Update breadcrumbs
			createBreadcrumbs(['Dashboard', 'Quizzes', 'Edit Quiz']);
		})
		.catch((error) => {
			console.error('Error fetching quiz:', error);
			alert('Error loading quiz data. Please try again.');
			document.getElementById('questions-container').innerHTML = '';
			addNewQuestion();
		});
}

// Add question to form when editing
function addQuestionToForm(question) {
	const questionTemplate = document.getElementById('question-template');
	const questionsContainer = document.getElementById('questions-container');

	// Clone the template
	const newQuestion = document.importNode(questionTemplate.content, true);

	// Set question number
	const questionCount = questionsContainer.children.length + 1;
	newQuestion.querySelector('.question-number').textContent = questionCount;

	// Set question text
	newQuestion.querySelector('.question-text').value = question.questionText;

	// Set unique name for radio buttons
	const radios = newQuestion.querySelectorAll('input[type="radio"]');
	const inputs = newQuestion.querySelectorAll('.option-text');

	radios.forEach((radio, index) => {
		radio.name = `correctOption_${questionCount - 1}`;
		radio.value = index;

		// Check the correct option
		if (index === question.correctOptionIndex) {
			radio.checked = true;
		}
	});

	// Set options text
	inputs.forEach((input, index) => {
		input.name = `options_${questionCount - 1}[]`;
		input.value = question.options[index] || '';
	});

	// Add remove question event listener
	newQuestion
		.querySelector('.remove-question-btn')
		.addEventListener('click', function () {
			this.closest('.question-item').remove();
			// Update question numbers
			const questions = questionsContainer.querySelectorAll('.question-item');
			questions.forEach((question, index) => {
				question.querySelector('.question-number').textContent = index + 1;

				// Update radio names
				const radios = question.querySelectorAll('input[type="radio"]');
				radios.forEach((radio) => {
					radio.name = `correctOption_${index}`;
				});

				// Update option names
				const inputs = question.querySelectorAll('.option-text');
				inputs.forEach((input) => {
					input.name = `options_${index}[]`;
				});
			});
		});

	// Append the new question
	questionsContainer.appendChild(newQuestion);
}

// Show delete confirmation modal
function showDeleteConfirmation(quiz) {
	state.currentQuiz = quiz;
	const modal = document.getElementById('delete-quiz-modal');
	modal.classList.add('active');
}

// Format date
function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString();
}

// API Functions
// Fetch quiz count (now handled by dashboard API)
async function fetchQuizCount() {
	try {
		const response = await fetch(`${API_BASE_URL}/dashboard`, {
			credentials: 'include',
		});
		if (!response.ok) {
			throw new Error('Failed to fetch dashboard data');
		}
		const data = await response.json();
		return data.totalQuizzes;
	} catch (error) {
		console.error('Error fetching quiz count:', error);
		return state.quizzes.length || 0;
	}
}

// Fetch question count (now handled by dashboard API)
async function fetchQuestionCount() {
	try {
		const response = await fetch(`${API_BASE_URL}/dashboard`, {
			credentials: 'include',
		});
		if (!response.ok) {
			throw new Error('Failed to fetch dashboard data');
		}
		const data = await response.json();
		return data.totalQuestions || 0;
	} catch (error) {
		console.error('Error fetching question count:', error);
		return state.questionCount || 0;
	}
}

// Fetch quizzes with pagination and filtering
async function fetchQuizzes(
	page = 1,
	pageSize = 10,
	category = '',
	difficulty = '',
	search = ''
) {
	try {
		// Build query parameters
		const params = new URLSearchParams({
			page: page.toString(),
			limit: pageSize.toString(),
		});

		if (category) {
			params.append('category', category);
		}

		if (difficulty) {
			params.append('difficulty', difficulty);
		}

		if (search) {
			params.append('search', search);
		}

		const response = await fetch(
			`${API_BASE_URL}/quizzes?${params.toString()}`,
			{
				credentials: 'include',
			}
		);

		if (!response.ok) {
			throw new Error('Failed to fetch quizzes');
		}

		const data = await response.json();

		return {
			quizzes: data.quizzes,
			totalPages: data.totalPages,
			totalQuizzes: data.totalQuizzes,
		};
	} catch (error) {
		console.error('Error fetching quizzes:', error);
		return { quizzes: [], totalPages: 0, totalQuizzes: 0 };
	}
}

// Fetch quiz by ID
async function fetchQuizById(quizId) {
	try {
		const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error('Failed to fetch quiz');
		}

		const quiz = await response.json();
		return quiz;
	} catch (error) {
		console.error('Error fetching quiz:', error);
		throw error;
	}
}

// Create a new quiz
async function createQuiz(quizData) {
	try {
		const response = await fetch(`${API_BASE_URL}/quizzes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(quizData),
			credentials: 'include',
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to create quiz');
		}

		const newQuiz = await response.json();

		// Update categories
		quizData.category && state.categories.add(quizData.category);

		return newQuiz;
	} catch (error) {
		console.error('Error creating quiz:', error);
		throw error;
	}
}

// Update a quiz
async function updateQuiz(quizId, quizData) {
	try {
		const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(quizData),
			credentials: 'include',
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to update quiz');
		}

		const updatedQuiz = await response.json();

		// Update categories
		quizData.category && state.categories.add(quizData.category);

		return updatedQuiz;
	} catch (error) {
		console.error('Error updating quiz:', error);
		throw error;
	}
}

// Delete a quiz
async function deleteQuiz(quizId) {
	try {
		const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
			method: 'DELETE',
			credentials: 'include',
		});

		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(errorData.message || 'Failed to delete quiz');
		}

		// Close modal
		document.getElementById('delete-quiz-modal').classList.remove('active');

		// Reload quizzes
		loadQuizzes();

		return true;
	} catch (error) {
		console.error('Error deleting quiz:', error);
		alert(`Error deleting quiz: ${error.message}`);
		// Close modal anyway
		document.getElementById('delete-quiz-modal').classList.remove('active');
		throw error;
	}
}

// Import quizzes
function importQuizzes() {
	alert('This feature will be implemented in a future update.');
}

// Export quizzes
async function exportQuizzes() {
	try {
		// Get all quizzes (without pagination)
		const response = await fetch(`${API_BASE_URL}/quizzes?limit=1000`, {
			credentials: 'include',
		});

		if (!response.ok) {
			throw new Error('Failed to fetch quizzes for export');
		}

		const data = await response.json();
		const quizzes = data.quizzes;

		// Create a blob with the JSON data
		const blob = new Blob([JSON.stringify(quizzes, null, 2)], {
			type: 'application/json',
		});

		// Create a download link
		const downloadLink = document.createElement('a');
		downloadLink.href = URL.createObjectURL(blob);
		downloadLink.download = `quizzes_export_${new Date()
			.toISOString()
			.slice(0, 10)}.json`;

		// Trigger download
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	} catch (error) {
		console.error('Error exporting quizzes:', error);
		alert('Error exporting quizzes. Please try again.');
	}
}

// Backup database
function backupDatabase() {
	alert('This feature will be implemented in a future update.');
}

// Reset database
function resetDatabase() {
	alert('This feature will be implemented in a future update.');
}
