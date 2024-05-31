import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const ConfirmationButton = ({ onClick, label, modalTitle, modalDescription, btn_class, text_dt, icond }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleButtonClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmation = (confirmed) => {
    setShowConfirmation(false);
    if (confirmed) {
      onClick();
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={btn_class}
      >
        <div className={text_dt}>{icond && <FontAwesomeIcon icon={icond} />}<div className='mx-2'>{label}</div></div>
      </button>
      <div className={`modal ${showConfirmation ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">{modalTitle}</h3>
          <p className="py-4">{modalDescription}</p>
          <div className="modal-action">

            <button
              className="btn btn-outline btn-success dark:text-[#DCEBFA]"
              onClick={() => handleConfirmation(true)}
            >
              Confirm
            </button>
            <button
              className="btn btn-outline btn-error dark:text-[#DCEBFA]"
              onClick={() => handleConfirmation(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default ConfirmationButton;