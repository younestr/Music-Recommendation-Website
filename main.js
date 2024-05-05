document.addEventListener("DOMContentLoaded", function() {
    var bioContent = document.querySelector(".bio-content");
    var offset = bioContent.getBoundingClientRect().top;
    var screenHeight = window.innerHeight;

    function handleScroll() {
        offset = bioContent.getBoundingClientRect().top;

        if (offset < screenHeight) {
            bioContent.classList.add("show");
        }
    }

    handleScroll(); // Trigger animation on page load

    window.addEventListener("scroll", handleScroll);

    var howItWorksButton = document.querySelector(".how-it-works-button");

    howItWorksButton.addEventListener("click", function(event) {
        event.preventDefault();
        var howItWorksModal = document.getElementById("how-it-works-modal");
        var howItWorksOffset = howItWorksModal.getBoundingClientRect().top;
        var scrollPosition = howItWorksOffset + window.pageYOffset - 100; // Adjusted offset to ensure the modal is fully visible

        window.scrollTo({
            top: scrollPosition,
            behavior: "smooth"
        });

        howItWorksModal.style.display = "block"; // Show the modal when "Learn More" button is clicked
    });

    var modal = document.getElementById("how-it-works-modal");
    var closeButton = document.querySelector(".close");

    closeButton.addEventListener("click", function() {
        modal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});
