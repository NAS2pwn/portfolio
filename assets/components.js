document.addEventListener('alpine:init', () => {
    Alpine.store('appStore', {
        pageLoaded: false,
        coverLoaded: false,
    });
});


function loading(minTimeLoading) {
    return {
        minTimeLoading : minTimeLoading,
        init() {
            this.loadContent();
        },
        async loadContent() {
            let percent = 0;
            const timer = setInterval(() => {
                if(percent < 100){
                    percent += Math.random() * 7;
                    percent = Math.min(percent, 99);
                    this.$refs.loadingPercentage.textContent = `${Math.round(percent)}%`;
                }
            }, 120);

            await Promise.all([
                this.delay(this.minTimeLoading),
                this.preloadImages([
                    './assets/images/pp/image_pixel80.png',
                    './assets/images/pp/image_pixel60.png',
                    './assets/images/pp/image_pixel40.png',
                    './assets/images/pp/image_pixel20.png',
                    './assets/images/pp/image_pixel10.png',
                    './assets/images/pp/image_pixel6.png',
                    './assets/images/cmz/walkthrough.png',
                    './assets/images/cmz/recherche_paris.png',
                    './assets/images/cmz/resultat_recherches.png',
                    './assets/images/cmz/parcours_plié.png',
                    './assets/images/cmz/parcours_deplie.png',
                    './assets/images/hm/landinghm.png',
                    './assets/images/hm/screenhm.png',
                    './assets/images/memoire/memoire_screen.png',
                    './assets/images/memoire/memoire_screen_hover.jpg',
                    './assets/images/wbnb/mockup_wherebnb.png',
                    './assets/images/wbnb/wbnb_mobile.png',
                ])
            ]);

            clearInterval(timer);

            if(percent < 100){
                percent = 100;
                this.$refs.loadingPercentage.textContent = '100%';
            }

            setTimeout(() => {
                this.$refs.loadingScreen.style.display = 'none';
                Alpine.store('appStore').pageLoaded = true;
                console.log("pageLoaded set to true")
            }, 200);
        },
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        preloadImages(images) {
            return Promise.all(images.map(src => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = src;
                });
            }));
        }
    }
}

function coverPage() {
    return {
        init() {
            this.$watch("Alpine.store('appStore').pageLoaded", (value) => {
                console.log("pageLoaded changed, value is "+value)
                if (value) {
                    this.imageTransition().then(() => {
                        Alpine.store('appStore').coverLoaded = true;
                        console.log("coverLoaded set to true")
                    });
                }
            });
        },
        imageTransition() {
            return new Promise(resolve => {
                const images = [
                    './assets/images/pp/image_pixel60.png',
                    './assets/images/pp/image_pixel40.png',
                    './assets/images/pp/image_pixel20.png',
                    './assets/images/pp/image_pixel10.png',
                ];
                const finalImage = './assets/images/pp/image_pixel6.png';

                let imageIndex = 0;
                const loadImageSequence = () => {
                    if (imageIndex < images.length) {
                        this.$refs.loadingImage.src = images[imageIndex];
                        imageIndex++;
                    } else {
                        this.$refs.loadingImage.src = finalImage;
                        clearInterval(intervalId);

                        resolve();
                    }
                };

                const intervalId = setInterval(loadImageSequence, 200);
            });
        }
    }
}

function slider(nb_sections) {
    return {
        isThrottled: true,
        currentSectionIndex: -1,
        max_section_index: nb_sections,
        threshold: 10,
        minTreshold: 1,
        bottomArrowLeft: -1,
        topArrowLeft: -1,
        startY: 0,
        deltaY: 0,
        isZooming: false,
        init() {
            this.$watch('Alpine.store("appStore").coverLoaded', (loaded) => {
                if (loaded && this.currentSectionIndex === 1) {
                    this.initArrows();
                }
            });
            this.$watch('Alpine.store("appStore").pageLoaded', (loaded) => {
                document.querySelector(`#section${this.currentSectionIndex}`).scrollIntoView(); 
                if (loaded && this.currentSectionIndex > 1) {
                    this.initArrows();
                }
            });

            

            window.addEventListener('load', () => {
                console.log("en legende")
                const yOffset = window.pageYOffset || document.documentElement.scrollTop;
                console.log("yOffset is "+yOffset)
                this.observeCurrentSection().then((index) => {
                    console.log("fdpcurrent section index is "+index)
                    this.currentSectionIndex = index;
                    console.log("scroll fdp")
                    if (this.currentSectionIndex === 1 && Alpine.store("appStore").coverLoaded) {
                        this.initArrows();
                    } else if (this.currentSectionIndex > 1 && Alpine.store("appStore").pageLoaded) {
                        this.initArrows();
                    }
                });
            });
        },
        observeCurrentSection() {
            return new Promise((resolve) => {
                const sections = document.querySelectorAll('section');
                const options = {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.5
                };
        
                const observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            console.log('Intersecting section:', entry.target);
                            observer.disconnect();
                            const currentSectionIndex = Array.from(sections).indexOf(entry.target) + 1;
                            resolve(currentSectionIndex);
                        }
                    });
                }, options);
        
                sections.forEach(section => {
                    console.log('Observing section:', section);
                    observer.observe(section);
                });
            });
        },
        initArrows(){
            if(this.currentSectionIndex !== 1){
                this.$refs.topArrow.classList.add('top-arrow-enter');
                this.$refs.topArrowContainer.classList.remove('arrow-container-desactivated');
            }
            if(this.currentSectionIndex !== this.max_section_index){
                this.$refs.bottomArrow.classList.add('bottom-arrow-enter');
                this.$refs.bottomArrowContainer.classList.remove('arrow-container-desactivated');
            }
            if(this.currentSectionIndex === 1)
                this.topArrowLeft = 0;
            else if (this.currentSectionIndex === this.max_section_index)
                this.bottomArrowLeft = 0;
            setTimeout(() => {
                if(this.currentSectionIndex !== 1)
                    this.$refs.topArrow.classList.remove('top-arrow-enter');
                if(this.currentSectionIndex !== this.max_section_index)
                    this.$refs.bottomArrow.classList.remove('bottom-arrow-enter');
                this.isThrottled = false;
            }, 200);
        },
        handleTouchStart(event) {
            if (event.touches.length > 1) {
                this.isZooming = true;
                return; // Ignore zoom gestures
            }
            this.isZooming = false;
            this.startY = event.touches[0].clientY;
        },
        handleTouchMove(event) {
            if (this.isZooming) return; // Ignore zoom gestures
            this.deltaY = this.startY - event.touches[0].clientY;
        },
        handleTouchEnd(event) {
            if (this.isThrottled) return;

            if (this.isZooming) {
                this.isZooming = false;
                return; // Ignore zoom gestures
            }

            if (event.target.closest('.scrollable-div') || event.target.closest('.carousel')) {
                // Ignore scrolls in scrollable divs or carousels
                return;
            }

            if (Math.abs(this.deltaY) >= this.threshold) {
                this.isThrottled = true;
                let down = (this.deltaY > 0);

                if (down)
                    this.goDown();
                else
                    this.goUp();
            }
            this.deltaY = 0; // Reset deltaY after handling
        },
        handleScroll(event) {
            if (this.isThrottled) return;

            if (event.ctrlKey) return;

            const intensity = Math.abs(event.deltaY);
            const down = (event.deltaY > 0);

            if (Math.abs(event.deltaY) >= this.threshold) {
                this.isThrottled = true;

                if (down){
                    this.$refs.bottomArrow.style.transform = '';
                    this.goDown();
                }
                else {
                    this.$refs.topArrow.style.transform = '';
                    this.goUp();
                }
            }
            else if(intensity >= this.minTreshold) {
                if(down)
                    this.$refs.bottomArrowContainer.classList.add('bottom-arrow-failed-slide-container')
                else
                    this.$refs.topArrowContainer.classList.add('top-arrow-failed-slide-container')

                setTimeout(() => {
                    this.$refs.bottomArrowContainer.classList.remove('bottom-arrow-failed-slide-container')
                    this.$refs.topArrowContainer.classList.remove('top-arrow-failed-slide-container')
                }, 500);
            }
        },
        checkScroll() {
            if (this.isThrottled) return;
            if (Math.abs(this.scrollAccumulator) >= this.threshold) {
                this.isThrottled = true;  // Empêcher de nouveaux déclenchements
                let down = (this.scrollAccumulator < 0);
                this.scrollAccumulator = 0;

                if (down) {
                    this.goDown();
                } else {
                    this.goUp();
                }
            }
        },
        clickUp() {
            if(this.currentSectionIndex === 1) return;
            if(this.isThrottled) return;
            this.isThrottled = true;

            this.goUp();
        },
        clickDown(){
            if (this.isThrottled) return;
            this.isThrottled = true;

            this.goDown();
        },
        goUp() {
            if(this.bottomArrowLeft==0){//this.currentSectionIndex === this.max_section_index){
                this.$refs.bottomArrow.style.opacity = 0;
                this.$refs.bottomArrow.classList.add('bottom-arrow-exit');
                this.$refs.bottomArrowContainer.classList.remove('arrow-container-desactivated')
                this.bottomArrowLeft = 1;
            }

            this.$refs.topArrow.classList.add('top-arrow-exit');

            setTimeout(() => {
                this.moveSectionUp();
                this.$refs.topArrow.classList.remove('top-arrow-exit');
                this.$refs.topArrow.classList.add('top-arrow-enter');
                this.$refs.topArrow.style.opacity = 0;
    
                if(this.bottomArrowLeft==1){//this.currentSectionIndex === this.max_section_index - 1){
                    this.$refs.bottomArrow.classList.remove('bottom-arrow-exit');
                    this.$refs.bottomArrow.classList.add('bottom-arrow-enter');
                    this.bottomArrowLeft = 2;
                }
                
                this.isThrottled = false;
                setTimeout(() => {
                    this.$refs.topArrow.classList.remove('top-arrow-enter');
                    if (this.currentSectionIndex===1){
                        this.$refs.topArrowContainer.classList.add('arrow-container-desactivated')
                        this.topArrowLeft = 0;
                    }
    
                    if(this.bottomArrowLeft==2){//tfhis.currentSectionIndex === this.max_section_index - 1){
                        this.$refs.bottomArrow.style.opacity = 1;
                        this.$refs.bottomArrow.classList.remove('bottom-arrow-enter');
                        this.bottomArrowLeft = -1;
                    }
                    this.$refs.topArrow.style.opacity = 1;
                }, 300);
            }, 200);
        },
        goDown() {
            if(this.topArrowLeft == 0){//this.currentSectionIndex === 1){
                this.$refs.topArrow.style.opacity = 0;
                this.$refs.topArrow.classList.add('top-arrow-exit');
                this.$refs.topArrowContainer.classList.remove('arrow-container-desactivated')
                this.topArrowLeft = 1;
            }
            this.$refs.bottomArrow.classList.add('bottom-arrow-exit');

            setTimeout(() => {
                this.moveSectionDown()
                this.$refs.bottomArrow.classList.remove('bottom-arrow-exit');
                this.$refs.bottomArrow.classList.add('bottom-arrow-enter');
                this.$refs.bottomArrow.style.opacity = 0;

                if(this.topArrowLeft==1){//this.currentSectionIndex === 2){
                    this.$refs.topArrow.classList.remove('top-arrow-exit');
                    this.$refs.topArrow.classList.add('top-arrow-enter');
                    this.topArrowLeft = 2;
                }

                this.isThrottled = false;
                setTimeout(() => {
                    this.$refs.bottomArrow.classList.remove('bottom-arrow-enter');
                    this.$refs.bottomArrow.style.opacity = 1;
                    if (this.currentSectionIndex===this.max_section_index){
                        this.$refs.bottomArrowContainer.classList.add('arrow-container-desactivated')
                        this.bottomArrowLeft = 0;
                    }

                    if(this.topArrowLeft==2){//this.currentSectionIndex === 2){
                        this.$refs.topArrow.style.opacity = 1;
                        this.$refs.topArrow.classList.remove('top-arrow-enter');
                        this.topArrowLeft = -1;
                    }
                }, 300);
            }, 200);
        },
        moveSectionDown() {
            if (this.currentSectionIndex < this.max_section_index ) {
                this.currentSectionIndex++;
                document.querySelector(`#section${this.currentSectionIndex}`).scrollIntoView({ behavior: 'smooth' });
            }
        },
        moveSectionUp() {
            if (this.currentSectionIndex > 1) {
                this.currentSectionIndex--;
                document.querySelector(`#section${this.currentSectionIndex}`).scrollIntoView({ behavior: 'smooth' });
            }
        }
    }
}

function carousel(elems_per_slide) {
    let one_elem_per_slide = [
        { title: "Front-end", text: "I create engaging user experiences, crafting responsive and intuitive interfaces.", image: "./assets/images/twemoji/laptop.svg" },
        { title: "Back-end", text: "I develop robust back-end architectures to support high-performing and secure applications.", image: "./assets/images/twemoji/server.svg" },
        { title: "CI/CD", text: "I implement CI/CD pipelines that enhance the efficiency and reliability of development cycles.", image: "./assets/images/twemoji/CI_CD.svg" },
        { title: "R&D", text: "I innovate in solving problems and creating new solutions, potentially using AI.", image: "./assets/images/twemoji/labo.svg" },
    ];
    let two_elems_per_slide = [
        [ 
            { title: "Front-end", text: "I create engaging user experiences, crafting responsive and intuitive interfaces.", image: "./assets/images/twemoji/laptop.svg" },
            { title: "Back-end", text: "I develop robust back-end architectures to support high-performing and secure applications.", image: "./assets/images/twemoji/server.svg" }
        ],
        [ 
            { title: "CI/CD", text: "I implement CI/CD pipelines that enhance the efficiency and reliability of development cycles.", image: "./assets/images/twemoji/CI_CD.svg" },
            { title: "R&D", text: "I innovate in solving problems and creating new solutions, potentially using AI.", image: "./assets/images/twemoji/labo.svg" }
        ],
    ];
    return {
        activeSlide: 0,
        dragging: false,
        startX: 0,
        currentTranslate: 0,
        indicatorPosition: 0, // Initial position of the moving dot
        slides: [],

        init() {
            this.slides = (elems_per_slide === 1) ? one_elem_per_slide : two_elems_per_slide;
        },

        changeSlide() {
            this.$refs.carousel.style.transform = `translateX(-${this.activeSlide * 100}vw)`;
            this.$refs.carousel.style.transition = 'transform 0.3s ease';
            this.indicatorPosition = this.activeSlide * 16;
        },

        clickNext() {
            this.activeSlide = Math.min(this.activeSlide + 1, this.slides.length - 1);
            this.changeSlide();
        },

        clickPrev() {
            this.activeSlide = Math.max(this.activeSlide - 1, 0);
            this.changeSlide();
        },

        startSwipe(event) {
            console.log("on est la")
            this.dragging = true;
            this.startX = event.clientX;
            event.target.setPointerCapture(event.pointerId);
            this.$refs.carousel.style.transition = 'none';  // Disable transition for smooth dragging
            this.$refs.indicator.style.transition = 'none';  // Disable transition for smooth dragging
        },
        
        moveSwipe(event) {
            if (this.dragging) {
                const currentX = event.clientX;
                const diffX = currentX - this.startX;
                this.currentTranslate = diffX;
                const slideWidth = this.$refs.carouselContainer.clientWidth;
                const translateX = (-this.activeSlide * 100) + (diffX / slideWidth * 100);
                this.$refs.carousel.style.transform = `translateX(${translateX}vw)`;
            }
        },
        
        endSwipe(event) {
            this.dragging = false;
            const threshold = window.innerWidth / 4;
            if (Math.abs(this.currentTranslate) > threshold) {
                this.activeSlide += (this.currentTranslate > 0) ? -1 : 1;
                this.activeSlide = Math.max(0, Math.min(this.activeSlide, this.slides.length - 1)); // Correct boundary limits
            }
            this.currentTranslate = 0;

            this.changeSlide();
        }
    }
}

function grid() {
    return {
        grid : [
            [ 
                { title: "Front-end", text: "I create engaging user experiences, crafting responsive and intuitive interfaces.", image: "./assets/images/twemoji/laptop.svg" },
                { title: "Back-end", text: "I develop robust back-end architectures to support high-performing and secure applications.", image: "./assets/images/twemoji/server.svg" }
            ],
            [ 
                { title: "CI/CD", text: "I implement CI/CD pipelines that enhance the efficiency and reliability of development cycles.", image: "./assets/images/twemoji/CI_CD.svg" },
                { title: "R&D", text: "I innovate in solving problems and creating new solutions, potentially using AI.", image: "./assets/images/twemoji/labo.svg" }
            ],
        ],
    }
}

function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log("Copied the text: " + text);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopyText(text); // Use fallback method on error
        });
    } else {
        fallbackCopyText(text); // Use fallback method if clipboard API is not available
    }
}

function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Avoid scrolling to bottom
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        console.log('Fallback: Copied the text: ' + text);
    } catch (err) {
        console.error('Fallback: Failed to copy: ', err);
    }
    document.body.removeChild(textArea);
}


function explosiveButton(action, params) {
    return {
        isAnimating: false,

        init() {
            this.$refs.firstSvg.style.transition = 'transform 0.2s, opacity 0.2s';
            this.$refs.secondSvg.style.transition = 'transform 0.2s, opacity 0.2s';
            this.$refs.secondSvg.style.opacity = 0;
            this.$refs.secondSvg.style.transform = 'scale(0)';
        },

        performAction() {
            if (this.isAnimating) return;
            this.isAnimating = true;
            
            this.animateFirstSvg();
            setTimeout(() => {
                action(...Object.values(params));
                this.animateSecondSvg().then(() => {
                    setTimeout(() => {
                        this.reset();
                    }, 700);
                });
            }, 100);
        },

        animateFirstSvg() {
            this.$refs.firstSvg.style.opacity = 0;
            this.$refs.firstSvg.style.transform = 'scale(0)';
        },

        animateSecondSvg() {
            return new Promise(resolve => {
                this.$refs.secondSvg.style.opacity = 1;
                this.$refs.secondSvg.style.transform = 'scale(1.15)';
                setTimeout(() => {
                    this.$refs.secondSvg.style.transform = 'scale(1)';
                    resolve();
                }, 200);
            });
        },

        reset() {
            this.$refs.secondSvg.style.transform = 'scale(0)';
            this.$refs.secondSvg.style.opacity = 0;

            this.$refs.firstSvg.style.opacity = 1;
            this.$refs.firstSvg.style.transform = 'scale(1)';

            setTimeout(() => {
                this.isAnimating = false;
            }, 200);
        }
    }
}

function linkHover(image_url, hover_image_url) {
    return {
        image: image_url,
        hover_image: hover_image_url,
        setHoverImage() {
            this.$refs.targetImage.src = this.hover_image;
        },
        resetImage() {
            this.$refs.targetImage.src = this.image;
        }
    }
}