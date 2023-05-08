import { defineStore } from 'pinia'
import supabase from '../supabase/index'

export default defineStore('tasks', {
  state() {
    return {
      tasks: [],
    }
  },
  getters: {
    getTaskById: (state) => {
      return (taskUrl) => state.tasks.filter((task) => task.url === taskUrl)[0];
    },
    completedTasks: (state) => {
      return state.tasks.filter((task) => task.is_complete);
    },
    pendingTasks: (state) => {
      return state.tasks.filter((task) => !task.is_complete);
    },
  },
  actions: {
    async _fetchTasks() {
      const { data, error } = await supabase.from('tasks').select()

      if (error) {
        console.error(error)
        return
      }

      console.log('all tasks from supabase -->', data)
      this.tasks = data;
    },
    async _addNewTask(newTask) {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTask.title,
          user_id: newTask.user_id,
          is_complete: newTask.is_complete,
          url: newTask.url,
          limit_date: newTask.limit_date,
          description: newTask.description,
          is_flagged: newTask.is_flagged
        })
        .select()

      if (error) {
        console.error(error)
        return
      }

      // Update local state
      this.tasks.push(data[0])
    },
    async _alternateDone(task_id, is_complete){
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_complete: !is_complete })
        .eq('id', task_id)
        .select()

      if (error) {
        console.error(error)
        return
      }

      // Update local state
      const taskToUpdate = this.tasks.find((task) => task.id === task_id)
      this.tasks = this.tasks.filter((task) => task.id !== taskToUpdate.id)
      this.tasks.push(data[0])
    },
    async _alternateFlag(task_id, is_flagged){
      const { data, error } = await supabase
        .from('tasks')
        .update({ is_flagged: !is_flagged })
        .eq('id', task_id)
        .select();

      if (error) {
        console.error(error)
        return
      }

      // Update local state
      const taskToUpdate = this.tasks.find((task) => task.id === task_id)
      this.tasks = this.tasks.filter((task) => task.id !== taskToUpdate.id)
      this.tasks.push(data[0]);
    },
    async _updateTask(task) {
      let newUrl = this._generateUrl(task.url)
      console.log(newUrl);
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: task.title,
          user_id: task.user_id,
          is_complete: task.is_complete,
          url: newUrl,
          limit_date: task.limit_date,
          description: task.description,
          is_flagged: task.is_flagged,
        })
        .eq('id', task.id)
        .select()

      if(error){
        console.error(error)
        return
      }

      // Update local state
      const taskToUpdate = this.tasks.find((task) => task.id === task.id)
      this.tasks = this.tasks.filter((task) => task.id !== taskToUpdate.id)
      this.tasks.push(data[0])
    },
    async _deleteTask(task_id){
      console.log(task_id);
      const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task_id)

      if(error){
        console.error(error)
        return
      }

      // Update local state
      const taskToDelete = this.tasks.find((task) => task.id === task.id);
      this.tasks = this.tasks.filter(task => task.id !== taskToDelete.id);
      console.log(this.tasks);
    },
    _generateUrl(title){
      console.log(`title --> ${title}`)
      let url = title.toLowerCase();

      console.log(`url --> ${url}`)

      if (url.includes(' ')) {
        url = url.split(' ').join('_')
      }

      return url;
    }
  }
})
