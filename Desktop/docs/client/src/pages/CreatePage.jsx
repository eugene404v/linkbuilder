import React from "react";

import { useHttp } from "../hooks/http.hook";
import {useHistory} from 'react-router-dom';
import { useDispatch, useSelector} from "react-redux";

function CreatePage() {
  const history = useHistory()
  const dispatch = useDispatch()
  const {token} = useSelector(state => state.authReducer)
  //const auth = React.useContext(AuthContext);
  const { request } = useHttp();
  const [link, setLink] = React.useState("");

  React.useEffect(() => {
    window.M.updateTextFields()
  }, [])

 const pressHandler = async (e) => {
    if (e.key === "Enter") {
      try {
        const data = await request(
          "/api/link/generate",
          "POST",
          { from: link },
          {
            authorization: `Bearer ${token}`,
          }
        );
        history.push(`/detail/${data.link._id}`)
      } catch (err) {}
    }
  };
  return (
    <div className="row">
      <div className="col s8 offset-s2"></div>
      <div className="input-field">
        <input
          id="link"
          className="validate"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onKeyPress={pressHandler}
        />
        <label htmlFor="link">Input link</label>
      </div>
    </div>
  );
}

export default CreatePage;
