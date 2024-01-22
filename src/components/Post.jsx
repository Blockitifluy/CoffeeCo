function PostUI(props) {
  return (
    <div class={`${props.styles.post} ${props.styles.user_post}`}>
      <h1>Title</h1>
      <sub>By Username</sub>
      <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Aliquam, ab! Voluptatem, tenetur beatae molestias hic quos ut, modi enim voluptates doloribus officiis dignissimos ad accusantium perspiciatis eligendi sunt atque. Dolores.</p>
    </div>
  )
}

export default PostUI;