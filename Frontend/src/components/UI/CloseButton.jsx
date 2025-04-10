export const CloseButton = ({onClick}) => {

    return (

        <button
            className="close-button"
            onClick={onClick}
            aria-label="Закрыть"
        >
            <span className="close-button__icon">&times;</span>
        </button>

    )
}