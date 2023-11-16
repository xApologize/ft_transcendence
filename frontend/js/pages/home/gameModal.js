import { World } from '../game/src/World.js';

export function securityUnload(event) {
  event.preventDefault();
  event.returnValue = '';
  
  const message = 'Are you sure you want to leave?';
  event.returnValue = message;
  return message; // For modern browsers
}

class GameModal {
    constructor(modalId) {
      this.modal = new bootstrap.Modal(document.getElementById(modalId), {
        animate: false,     // Disable modal animation
        backdrop: 'static', // Prevent closing by clicking on the backdrop
        keyboard: false,    // Disable closing with the escape key
        scrollable: false,  // Prevent page scrolling when modal is open
      });
      this.modalID = modalId;
      this.modalWindow = document.getElementById('gameModalWindow')
      this.modalHeader = document.getElementById('gameModalHeader');
      this.modalTitle = document.getElementById('gameModalTitle');
      this.modalBody = document.getElementById('gameModalBody')
      this.closeButton = document.getElementById('closeButtonModal');
      
      this.world = null;
      this.closeWorld = this.closeWorld.bind(this);
      this.closeModal = this.closeModal.bind(this)
    }

    openModal() {
      console.log('open modal')

      this.modalToggleFullscreen(true)
      this.modal.show();
      this.modal._element.addEventListener('hidden.bs.modal', this.closeModal)
      window.addEventListener('beforeunload', securityUnload)
    }
  
    closeModal() {
      console.log('close Modal')
      this.modalToggleFullscreen(false)
      this.updateModalContent('', '')
      this.modal.hide();
      if (this.world !== null) {
        this.closeWorld()
      }
      this.modal._element.removeEventListener('hidden.bs.modal', this.closeModal);
      window.removeEventListener('beforeunload', securityUnload)
      history.replaceState({ route: '/' }, null, '/')
      // Remove it when going <- and -> in browser ?
    }

    setBackdrop(backdrop) {
      this.modal._config.backdrop = backdrop;
    }
  
    hideCloseButton() {
      this.closeButton.style.display = 'none'
    }

    showCloseButton() {
      this.closeButton.style.display = ''
    }

    hideHeader() {
      this.modalHeader.style.display = 'none';
    }

    showHeader() {
      this.showCloseButton()
      this.showTitle()
      this.modalHeader.style.display = '';
    }

    showTitle() {
      this.modalTitle.style.display = ''
    }

    hideTitle() {
      this.modalTitle.style.display = 'none'
    }

    setTitle(newTitle) {
      this.modalTitle.innerHTML = newTitle
    }

    modalToggleFullscreen(state) {
      this.modalWindow.classList.toggle('modal-fullscreen', state);
    }

    removeCanvas() {
      const canvasElement = this.modalBody.querySelector('canvas');
      if (canvasElement) {
        this.modalBody.removeChild(canvasElement);
      }
    }

    isModalShown() {
      return this.modal._isShown;
    }

    updateModalContent(content, title) {
      if (content !== null && content !== undefined) {
        this.modalBody.innerHTML = content;
      }
    
      if (title !== null && title !== undefined) {
        this.modalTitle.innerHTML = title;
      }
    }

    launchWorld() {
      if (this.isModalShown()) {
        console.log('launch world')
        this.world = new World(this.modalBody);
        this.world.start();
        // this.modal._element.addEventListener('hidden.bs.modal', this.closeWorld);
      } else {
        console.log('World not launch because model not shown.')
      }
    }

    closeWorld() {
      console.log('stop world')
      this.world.stop();
      this.world = null

    }
  }

  export default GameModal;