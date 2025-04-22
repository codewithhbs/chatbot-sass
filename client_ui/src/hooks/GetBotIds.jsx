import { useState, useEffect, useContext } from "react";
import axios from "axios";

import AuthContext from "@/context/authContext";
import { API_URL } from "@/constant/Urls";
import { toast } from "sonner";

const useGetBotIds = () => {
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {token} = useContext(AuthContext)

    useEffect(() => {
        const fetchBots = async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `${API_URL}/auth/get-my-chatbot?token=${token}`
                );
                console.log(res.data, "chatbots")
                if (res.data.length === 0) {
                    toast.error("No chatbots found");
                }
                setBots(res.data)
            } catch (err) {
                const errorMessage =
                    err.response?.data?.message || "Could not fetch your chatbots";
                setError(errorMessage);
                toast.error("Failed to fetch chatbots");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchBots();
        }
    }, [token]);

    return { bots, loading, error };
};

export default useGetBotIds;