// Importar funções necessárias do Firebase
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { getFirestore, collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

        // *********************************************************************************
        // ** CONFIGURAÇÃO DO FIREBASE                                                  **
        // *********************************************************************************
        const firebaseConfig = {
          apiKey: "AIzaSyA--D4lqptEjsOeghcXeqaJDGeUEB2T6ms",
          authDomain: "site-jsferreira.firebaseapp.com",
          projectId: "site-jsferreira",
          storageBucket: "site-jsferreira.firebasestorage.app",
          messagingSenderId: "597784587456",
          appId: "1:597784587456:web:2736c7ddbe5ab689819125"
        };
        // *********************************************************************************
        // ** FIM DA ÁREA DE CONFIGURAÇÃO                                                 **
        // *********************************************************************************


        // Inicializar Firebase
        try {
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            console.log("Firebase inicializado com sucesso!");

            // --- LÓGICA DO SLIDER DE TESTEMUNHOS ---
            const testimonialContainer = document.getElementById('testimonial-container');
            const prevBtn = document.getElementById('prev-testimonial');
            const nextBtn = document.getElementById('next-testimonial');
            let testimonials = [];
            let currentIndex = 0;

            async function fetchTestimonials() {
                try {
                    const testimonialsCol = collection(db, 'testimonials');
                    const q = query(testimonialsCol, where('approved', '==', true));
                    const snapshot = await getDocs(q);

                    if (snapshot.empty) {
                        testimonialContainer.innerHTML = `
                            <div class="testimonial-slide flex-shrink-0 w-full">
                               <div class="bg-blue-700 p-8 rounded-xl shadow-lg">
                                   <p class="text-lg italic mb-4">Seja o primeiro a deixar uma avaliação sobre o nosso trabalho!</p>
                                   <p class="font-bold text-yellow-300">- Equipa JS Ferreira</p>
                               </div>
                            </div>`;
                        return;
                    }

                    let fetchedTestimonials = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    
                    fetchedTestimonials.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

                    testimonials = fetchedTestimonials;
                    renderTestimonials();

                } catch (error) {
                    console.error("Erro ao buscar testemunhos: ", error);
                     testimonialContainer.innerHTML = `
                        <div class="testimonial-slide flex-shrink-0 w-full">
                           <div class="bg-blue-700 p-8 rounded-xl shadow-lg">
                               <p class="text-lg italic mb-4">Não foi possível carregar os testemunhos. Tente novamente mais tarde.</p>
                           </div>
                        </div>`;
                }
            }

            function renderTestimonials() {
                testimonialContainer.innerHTML = '';
                testimonials.forEach(testimonial => {
                    const slide = document.createElement('div');
                    slide.className = 'testimonial-slide flex-shrink-0 w-full';
                    slide.innerHTML = `
                        <div class="bg-blue-700 p-8 rounded-xl shadow-lg">
                            <p class="text-lg italic mb-4">"${testimonial.message}"</p>
                            <p class="font-bold text-yellow-300">- ${testimonial.name}${testimonial.company ? `, ${testimonial.company}` : ''}</p>
                        </div>`;
                    testimonialContainer.appendChild(slide);
                });
                
                if (testimonials.length > 1) {
                    prevBtn.classList.remove('hidden');
                    nextBtn.classList.remove('hidden');
                }
                updateSlider();
            }

            function updateSlider() {
                testimonialContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
            }

            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex + 1) % testimonials.length;
                updateSlider();
            });

            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
                updateSlider();
            });
            
            // --- LÓGICA DO FORMULÁRIO DE ENVIO DE TESTEMUNHOS ---
            const testimonialForm = document.getElementById('testimonial-form');
            const successMessage = document.getElementById('form-success-message');
            const errorMessage = document.getElementById('form-error-message');
            const submitBtn = document.getElementById('submit-testimonial-btn');

            testimonialForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';

                const name = document.getElementById('testimonial-name').value;
                const company = document.getElementById('testimonial-company').value;
                const message = document.getElementById('testimonial-message').value;


                try {
                    await addDoc(collection(db, 'testimonials'), {
                        name,
                        company,
                        message,
                        approved: false, // Novos testemunhos precisam de aprovação
                        createdAt: new Date()
                    });

                    testimonialForm.reset();
                    successMessage.classList.remove('hidden');
                    errorMessage.classList.add('hidden');
                    
                    setTimeout(() => {
                        closeModal(document.getElementById('modal-feedback'));
                        successMessage.classList.add('hidden');
                    }, 3000);


                } catch (error) {
                    console.error("Erro ao adicionar testemunho: ", error);
                    errorMessage.classList.remove('hidden');
                    successMessage.classList.add('hidden');
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Enviar Avaliação';
                }
            });

            // Carregar testemunhos ao iniciar
            fetchTestimonials();

        } catch (e) {
            console.error("Erro na inicialização do Firebase. Verifique a sua configuração.", e);
            document.getElementById('testimonial-container').innerHTML = `
                <div class="testimonial-slide flex-shrink-0 w-full">
                   <div class="bg-blue-700 p-8 rounded-xl shadow-lg">
                       <p class="text-lg italic mb-4 text-red-300">Erro de configuração. Não foi possível conectar à base de dados de testemunhos.</p>
                   </div>
                </div>`;
        }


        // --- Resto do seu script (Menus, Modals, etc.) ---
        lucide.createIcons();

        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
        
        document.getElementById('year').textContent = new Date().getFullYear();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.section-fade-in').forEach(section => {
            observer.observe(section);
        });

        const openModalButtons = document.querySelectorAll('[data-modal-target]');
        
        openModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = document.querySelector(button.dataset.modalTarget);
                openModal(modal);
            });
        });

        function openModal(modal) {
            if (modal == null) return;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
            
            const closeModalButtons = modal.querySelectorAll('.close-modal-btn');
            closeModalButtons.forEach(button => {
                button.addEventListener('click', () => closeModal(modal));
            });
            modal.addEventListener('click', e => {
                if (e.target === modal) closeModal(modal);
            });
        }

        function closeModal(modal) {
            if (modal == null) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = 'auto';
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal:not(.hidden)');
                if (openModal) closeModal(openModal);
            }
        });