"use client";
import React, { useEffect, useState, useRef } from "react";
import {
  LoadingOutlined,
  CloseOutlined,
  SendOutlined,
} from "@ant-design/icons";

// const host = "ws://localhost:3000/ws";
const host = "https://be-random-chat.onrender.com/ws"; //dev

export default function About() {
  const ws = useRef(null);
  const [text, setText] = useState("");
  const [textList, setTextList] = useState([]);
  const [id, setId] = useState("");
  const [objectId, setObjectId] = useState("");
  const [status, setStatus] = useState("");
  const findObjectRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [receiveUserToBottom, setReceiveUserToBottom] = useState(false);

  useEffect(() => {
    ws.current = new WebSocket(host);

    ws.current.onopen = (res) => {};

    ws.current.onmessage = (res) => {
      const text = JSON.parse(res.data);
      console.log(text);
      if (text.uuid) setId(text.uuid);
      if (text.status) setStatus(text.status);
      if (text.objectId) {
        setObjectId(text.objectId);
        clearInterval(findObjectRef.current);
        findObjectRef.current = null;
        setText("");
        setTextList([]);
        setLoading(false);
      }
      if (text.content) {
        // const under = isAtBottom();
        setTextList((pre) => [
          ...pre,
          { content: text.content, context: text.context, time: text.time },
        ]);
        console.log(under);
        // if (under) setReceiveUserToBottom(!receiveUserToBottom);
        console.log(textList);
      }
    };
  }, []);

  useEffect(() => {
    // toBottom();
  }, [receiveUserToBottom]);

  const send = () => {
    if (text != "") {
      setTextList((prev) => [
        ...prev,
        { content: text, context: "own", time: getTime() },
      ]);

      ws.current.send(
        JSON.stringify({
          content: text,
          objectId,
          uuid: id,
          status,
          time: getTime(),
        })
      );
    }
    // toBottom();
    setText("");
  };

  const search = () => {
    if (loading) return;
    findObjectRef.current = setInterval(() => {
      console.log("尋找中...");
      setLoading(true);
      ws.current.send(
        JSON.stringify({
          uuid: id,
          status: "wait",
        })
      );
    }, 1000);
  };

  const stopSearch = () => {
    clearInterval(findObjectRef.current);
    findObjectRef.current = null;
    setLoading(false);
  };

  const quit = () => {
    ws.current.send(
      JSON.stringify({
        objectId,
        status: "quit",
      })
    );

    setObjectId("");
  };

  const getTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const period = hours >= 12 ? "下午" : "上午";
    hours = hours % 12 || 12;
    const time = `${period} ${hours}:${minutes}`;
    return time;
  };

  const isAtBottom = () => {
    const scrollPosition = window.scrollY; // 當前滾動位置
    const windowHeight = window.innerHeight; // 視窗高度
    const documentHeight = document.documentElement.scrollHeight; // 頁面總高度

    return scrollPosition + windowHeight >= documentHeight - 1;
  };

  const toBottom = () => {
    window.scroll({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col justify-end w-full min-h-screen bg-red-400">
      {!objectId && (
        <div
          onClick={() => search()}
          className="hover:cursor-pointer text-center leading-[200px] absolute w-[200px] h-[200px] bg-slate-200 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <CloseOutlined onClick={() => stopSearch()} />
              <span>尋找中...</span>
              <LoadingOutlined />
            </div>
          ) : (
            "尋找"
          )}
        </div>
      )}

      {objectId && (
        <div className="relative">
          {/* <span>{id}</span>
          <span>對方{objectId}</span> */}
          <div className="w-full px-3">
            {textList.map((i, index) => (
              <div
                key={index}
                className={`mb-3 ${
                  i.context === "own" ? "text-right" : "text-left"
                }`}
              >
                {i.context === "own" && (
                  <span className="mr-1 text-xs align-bottom">{i.time}</span>
                )}
                <span className="inline-block p-2 rounded-lg bg-slate-300">
                  {i.content}
                </span>
                {i.context != "own" && (
                  <span className="ml-1 text-xs align-bottom">{i.time}</span>
                )}
              </div>
            ))}
          </div>

          <form
            className="sticky bottom-0 flex justify-center w-full gap-3 pt-1 pb-3 text-center backdrop-blur-lg bg-gradient-to-t from-black/20"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <button type="button" onClick={() => quit()}>
              退出
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-[50%] p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />

            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              onClick={() => send()}
            >
              <SendOutlined />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
