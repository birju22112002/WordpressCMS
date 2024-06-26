/** @format */
"use client";

import { useEffect, useState, useContext } from "react";
import { Row, Col, Button, Input, List, Modal } from "antd";
import Link from "next/link";
import { PlusOutlined } from "@ant-design/icons";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/auth";
import { ThemeContext } from "../../context/ThemeContext";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import CommentForm from "./CommentForm";
import toast from "react-hot-toast";
import styles from "./Comments.module.css";

dayjs.extend(localizedFormat);

function UserComments() {
  // context
  const [auth, setAuth] = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);

  // state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [selectedComment, setSelectedComment] = useState({});
  const [content, setContent] = useState("");
  const [visible, setVisible] = useState(false);
  // hook
  const router = useRouter();

  useEffect(() => {
    if (auth?.token) {
      fetchComments();
    }
  }, [auth?.token]);

  useEffect(() => {
    if (page === 1) return;
    if (auth?.token) fetchComments();
  }, [page]);

  const fetchComments = async () => {
    try {
      const { data } = await axios.get(`/user-comments`);
      setComments(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (comment) => {
    try {
      const answer = window.confirm("Are you sure you want to delete?");
      if (!answer) return;
      const { data } = await axios.delete(`/comment/${comment._id}`);
      if (data?.ok) {
        setComments(comments.filter((c) => c._id !== comment._id));
        setTotal(total - 1);
        toast.success("Comment deleted successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(`/comment/${selectedComment._id}`, {
        content,
      });

      let arr = comments;
      const index = arr.findIndex((c) => c._id === selectedComment._id);
      arr[index].content = data.content;
      setComments(arr);

      setVisible(false);
      setLoading(false);
      setSelectedComment({});

      toast.success("Comment updated");
    } catch (err) {
      console.log(err);
      setVisible(false);
    }
  };

  const filteredComments = comments?.filter((comment) =>
    comment.content.toLowerCase().includes(keyword)
  );
  const listStyle = {
    backgroundColor: theme === "dark" ? "#000" : "#fff",
  };

  const listItemStyle = {
    color: theme === "dark" ? "#fff" : "#000",
  };
  const inputStyle = {
    backgroundColor: theme === "dark" ? "transparent" : "#fff",
    color: theme === "dark" ? "#fff" : "#000",
    borderColor: theme === "dark" ? "#555" : "#d9d9d9",
  };
  return (
    <>
      <Row className={styles.container}>
        <Col span={24}>
          <h1 style={{ marginTop: 15, color: listItemStyle.color }}>
            {comments?.length} Comments
          </h1>
          <br />
          <Input
            placeholder='Search'
            type='search'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value.toLowerCase())}
            style={{ ...inputStyle, marginBottom: 15 }}
            className={theme === "dark" ? styles.darkInput : ""}
          />
          <List
            itemLayout='horizontal'
            dataSource={filteredComments}
            style={listStyle}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Link
                    key={item._id}
                    href={`/pages/posts/${item?.postId?.slug}#${item._id}`}
                    style={listItemStyle}>
                    view
                  </Link>,
                  <a
                    key='edit'
                    onClick={() => {
                      setSelectedComment(item);
                      setVisible(true);
                      setContent(item.content);
                    }}
                    style={listItemStyle}>
                    edit
                  </a>,
                  <a
                    key='delete'
                    onClick={() => handleDelete(item)}
                    style={listItemStyle}>
                    delete
                  </a>,
                ]}
                className={styles.listItem}
                style={listStyle}>
                <List.Item.Meta
                  description={
                    <span style={listItemStyle}>
                      On {item?.postId?.title} | {item?.postedBy?.name} |
                      {dayjs(item.createdAt).format("L LT")}
                    </span>
                  }
                  title={<span style={listItemStyle}>{item.content}</span>}
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Modal
            open={visible}
            title='Update comment'
            onOk={() => setVisible(false)}
            onCancel={() => setVisible(false)}
            footer={null}>
            <CommentForm
              handleSubmit={handleSubmit}
              comment={content}
              setComment={setContent}
              loading={loading}
            />
          </Modal>
        </Col>
      </Row>
    </>
  );
}

export default UserComments;
