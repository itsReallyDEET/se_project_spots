import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "c6ab190d-6558-4967-82d9-2ba8a3536ac0",
    "Content-Type": "application/json",
  },
});

let currentUserId;

api
  .getAppInfo()
  .then(([cardsData, userData]) => {
    currentUserId = userData._id;
    cardsData.forEach((item) => {
      const cardElement = getCardElement(item);
      cardsList.append(cardElement);
    });

    profileNameEl.textContent = userData.name;
    profileDescriptionEl.textContent = userData.about;
    document.querySelector(".profile__avatar").src = userData.avatar;
  })

  .catch(console.error);

// Profile form elements
const editProfileBtn = document.querySelector(".profile__edit-btn");
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileFormEl = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input",
);
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input",
);

// Card form elements
const newPostBtn = document.querySelector(".profile__add-btn");
const newPostModal = document.querySelector("#new-post-modal");
const cardSubmitBtn = newPostModal.querySelector(".modal__submit-btn");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newCardFormEl = newPostModal.querySelector(".modal__form");
const newNameInput = newPostModal.querySelector("#card-caption-input");
const newLinkInput = newPostModal.querySelector("#card-image-input");

// Avatar form elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarFormEl = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-btn");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-btn");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteModalCloseBtn = deleteModal.querySelector(
  ".modal__close-btn_delete",
);
const cancelDeleteBtn = deleteModal.querySelector(".modal__card-cancel-btn");

// Profile info elements
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");

// Preview modal elements
const cardPreview = document.querySelector("#preview-modal");
const cardPrevCloseBtn = cardPreview.querySelector(".modal__close-btn_preview");
const cardPrevImage = cardPreview.querySelector(".modal__image-preview");
const cardPrevCaption = cardPreview.querySelector(".modal__caption");

// Card related elements
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");

  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__del-btn");

  const isLiked = data.isLiked;
  if (isLiked) {
    cardLikeBtn.classList.add("card__like-btn_active");
  }

  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;

  cardLikeBtn.addEventListener("click", (evt) => handleLike(evt, data._id));
  cardDeleteBtn.addEventListener("click", (evt) =>
    handleDeleteCard(cardElement, data._id),
  );
  cardImageEl.addEventListener("click", handleImageClick);

  return cardElement;
}

function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", handleEscape);
}

function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", handleEscape);
}

function handleDeleteCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = deleteForm.querySelector(".modal__card-delete-btn");
  submitBtn.textContent = "Deleting";
  submitBtn.disabled = true;

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error);
}

function handleDeleteCard(cardElement, cardId) {
  console.log(cardId);
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal);
}

function handleImageClick(evt) {
  const cardElement = evt.target.closest(".card");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");

  cardPrevImage.src = cardImageEl.src;
  cardPrevImage.alt = cardImageEl.alt;
  cardPrevCaption.textContent = cardTitleEl.textContent;

  openModal(cardPreview);
}

function handleLike(evt, cardId) {
  const likeBtn = evt.target;
  const isLiked = likeBtn.classList.contains("card__like-btn_active");
  api
    .toggleLikeCard(cardId, isLiked)
    .then((updatedCard) => {
      if (updatedCard.isLiked) {
        likeBtn.classList.add("card__like-btn_active");
      } else {
        likeBtn.classList.remove("card__like-btn_active");
      }
    })
    .catch(console.error);
}

editProfileBtn.addEventListener("click", function () {
  resetValidation(
    editProfileFormEl,
    [editProfileNameInput, editProfileDescriptionInput],
    settings,
  );

  openModal(editProfileModal);
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
});

editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});

newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});

newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});

deleteModalCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

cancelDeleteBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

cardPrevCloseBtn.addEventListener("click", () => {
  closeModal(cardPreview);
});

function handleProfileFormSubmit(evt) {
  evt.preventDefault();

  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((updatedUser) => {
      profileNameEl.textContent = updatedUser.name;
      profileDescriptionEl.textContent = updatedUser.about;
      closeModal(editProfileModal);
    })
    .catch(console.error);
}

function handleAvatarFormSubmit(evt) {
  evt.preventDefault();

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      document.querySelector(".profile__avatar").src = data.avatar;
      closeModal(avatarModal);
    })
    .catch(console.error);
}

editProfileFormEl.addEventListener("submit", handleProfileFormSubmit);

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  api
    .addCard({
      name: newNameInput.value,
      link: newLinkInput.value,
    })
    .then((newCard) => {
      const cardElement = getCardElement(newCard);
      cardsList.prepend(cardElement);

      evt.target.reset();
      disableButton(cardSubmitBtn, settings);
      closeModal(newPostModal);
    })
    .catch(console.error);
}

function handleEscape(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    closeModal(openedModal);
  }
}

newCardFormEl.addEventListener("submit", handleAddCardSubmit);

const modals = document.querySelectorAll(".modal");

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

avatarFormEl.addEventListener("submit", handleAvatarFormSubmit);

deleteForm.addEventListener("submit", handleDeleteCardSubmit);

modals.forEach((modal) => {
  modal.addEventListener("click", (evt) => {
    if (evt.target.classList.contains("modal_is-opened")) {
      closeModal(modal);
    }
  });
});

enableValidation(settings);
