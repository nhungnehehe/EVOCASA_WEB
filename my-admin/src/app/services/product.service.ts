
  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);
  
    return this.http.post<{ filename: string }>('http://localhost:3002/upload', formData).pipe(
      map(response => `http://localhost:3002/image/${response.filename}`)
    );
}}
