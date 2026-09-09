import "./Spinner.css";

type SpinnerProps = {
    text?: string;
};

export const Spinner = ({ text = "Loading..." }: SpinnerProps) => {
    return (
        <div className="spinner">
            <span className="spinner__circle" aria-hidden="true" />
            <span className="spinner__text">{text}</span>
        </div>
    );
};
